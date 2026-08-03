import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoMarketData } from '@/app/actions/prices';
import { selectTriggeredAlerts, type PriceAlertRow } from '@/lib/alerts';
import { resend, EMAIL_FROM } from '@/lib/email';
import { getWalletData, getErc20Balances } from '@/app/actions/wallet';
import { getSolanaWalletData } from '@/app/actions/solana';
import { getBitcoinWalletData } from '@/app/actions/bitcoin';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.remedly.fr';

function fmtEur(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const marketData = await getCryptoMarketData();
  if (!marketData) {
    return NextResponse.json({ error: 'Market data unavailable' }, { status: 502 });
  }

  // 1. ÉVALUATION ET DÉCLENCHEMENT DES ALERTES DE PRIX / VARIATION 24h
  const { data: alerts, error: alertsError } = await supabase
    .from('price_alerts')
    .select('id, crypto, direction, target_price, alert_type, email, active')
    .eq('active', true);

  const triggered = selectTriggeredAlerts((alerts as PriceAlertRow[]) || [], marketData);
  const sendErrors: string[] = [];

  let sent = 0;
  for (const { alert, value } of triggered) {
    const sym = alert.crypto.toUpperCase();
    const is24h = alert.alert_type === 'change_24h';
    const sens = alert.direction === 'above' ? 'au-dessus de' : 'en-dessous de';
    const formattedVal = is24h ? `${value.toFixed(2)} %` : fmtEur(value);
    const targetVal = is24h ? `${alert.target_price} %` : fmtEur(alert.target_price);

    try {
      if (resend) {
        const { error: sendErr } = await resend.emails.send({
          from: EMAIL_FROM,
          to: alert.email,
          subject: `Alerte ${is24h ? 'variation 24h' : 'prix'} ${sym} — seuil atteint`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
              <h2 style="color:#534AB7">Alerte Remedly Pro</h2>
              <p>Le cours ou la variation 24h de <strong>${sym}</strong> est passé(e) ${sens} votre seuil.</p>
              <p style="font-size:20px"><strong>${formattedVal}</strong> (seuil configuré : ${targetVal})</p>
              <p><a href="${SITE_URL}/alertes" style="color:#534AB7">Gérer mes alertes</a></p>
              <p style="color:#888;font-size:12px">Ceci n'est pas un conseil en investissement.</p>
            </div>`,
        });
        if (sendErr) throw new Error((sendErr as any).message || JSON.stringify(sendErr));
      }
      await supabase
        .from('price_alerts')
        .update({ active: false, triggered_at: new Date().toISOString() })
        .eq('id', alert.id);
      sent++;
    } catch (err: any) {
      console.error(`Alerte ${alert.id} : échec envoi email`, err);
      sendErrors.push(err?.message || String(err));
    }
  }

  // 2. RECUPERATION DES ABONNÉS PRO ACTIFS POUR DIGEST HEBDO ET SNAPSHOTS
  const { data: proSubs } = await supabase
    .from('subscriptions')
    .select('user_id, privy_id, status')
    .eq('status', 'active');

  const todayStr = new Date().toISOString().split('T')[0];
  const isSunday = new Date().getDay() === 0;

  let snapshotCount = 0;
  let digestCount = 0;

  if (proSubs && proSubs.length > 0) {
    for (const sub of proSubs) {
      try {
        const { data: user } = await supabase
          .from('users')
          .select('id, privy_id, email, wallet_address, solana_wallet_address, bitcoin_wallet_address, weekly_digest')
          .eq('user_id', sub.user_id)
          .maybeSingle();

        if (!user) continue;

        let totalValue = 0;
        if (user.wallet_address) {
          const ethData = await getWalletData(user.wallet_address);
          if (ethData?.balanceEth && marketData['eth']) {
            totalValue += Number(ethData.balanceEth) * marketData['eth'].price;
          }
        }
        if (user.solana_wallet_address) {
          const solData = await getSolanaWalletData(user.solana_wallet_address);
          if (solData?.balanceSol && marketData['sol']) {
            totalValue += Number(solData.balanceSol) * marketData['sol'].price;
          }
        }
        if (user.bitcoin_wallet_address) {
          const btcData = await getBitcoinWalletData(user.bitcoin_wallet_address);
          if (btcData?.balanceBtc && marketData['btc']) {
            totalValue += Number(btcData.balanceBtc) * marketData['btc'].price;
          }
        }

        // ÉCRITURE DU SNAPSHOT QUOTIDIEN
        await supabase.from('portfolio_snapshots').upsert([
          {
            user_id: user.id,
            snapshot_date: todayStr,
            total_value_eur: Math.round(totalValue * 100) / 100,
          }
        ], { onConflict: 'user_id,snapshot_date' });
        snapshotCount++;

        // ENVOI DU DIGEST HEBDOMADAIRE RESEND LE DIMANCHE
        if (isSunday && (user.weekly_digest !== false) && user.email && resend) {
          await resend.emails.send({
            from: EMAIL_FROM,
            to: user.email,
            subject: `Récapitulatif Hebdomadaire Remedly Pro — ${todayStr}`,
            html: `
              <div style="font-family:sans-serif;max-width:500px;margin:auto;background:#252844;color:#fff;padding:24px;border-radius:16px">
                <h2 style="color:#6366f1;margin-top:0">Votre Bilan Hebdomadaire Remedly Pro</h2>
                <p>Voici la synthèse hebdomadaire de votre portefeuille :</p>
                <div style="background:#2d3152;padding:16px;border-radius:12px;margin-bottom:16px">
                  <p style="margin:0;font-size:12px;color:#aaa">Valeur estimée du portefeuille</p>
                  <p style="margin:4px 0 0 0;font-size:24px;font-weight:bold">${fmtEur(totalValue)}</p>
                </div>
                <p><a href="${SITE_URL}/analyses" style="background:#6366f1;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Voir mes analyses complètes</a></p>
              </div>`,
          });
          digestCount++;
        }
      } catch (e) {
        console.error(`Snapshot/Digest error for user ${sub.user_id}`, e);
      }
    }
  }

  const diag = {
    checked: alerts?.length || 0,
    alertsError: alertsError?.message || null,
    btcPrice: marketData['btc']?.price ?? null,
    resendConfigured: !!resend,
    triggered: triggered.length,
    sent,
    snapshotCount,
    digestCount,
    isSunday,
    sendErrors,
  };
  console.log('CRON check-alerts DIAG', JSON.stringify(diag));
  return NextResponse.json(diag);
}
