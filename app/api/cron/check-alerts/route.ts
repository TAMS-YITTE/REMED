import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCryptoPrices } from '@/app/actions/prices';
import { selectTriggeredAlerts, type PriceAlertRow } from '@/lib/alerts';
import { resend, EMAIL_FROM } from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.remedly.fr';

function fmtEur(n: number) {
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
}

// Cron Vercel : vérifie les alertes de prix et envoie les emails déclenchés.
// Sécurisé par CRON_SECRET (Vercel envoie Authorization: Bearer <CRON_SECRET>).
export async function GET(request: Request) {
  // Mode diagnostic LECTURE SEULE (aucun email, aucune écriture) — temporaire.
  if (new URL(request.url).searchParams.get('probe') === '1') {
    const p = await getCryptoPrices();
    const { data: al, error: e } = await supabase
      .from('price_alerts')
      .select('id, crypto, direction, target_price, active')
      .eq('active', true);
    return NextResponse.json({
      usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      resendConfigured: !!resend,
      btcPrice: p?.['btc'] ?? null,
      activeAlerts: al?.length ?? 0,
      alertsError: e?.message ?? null,
      sample: al?.slice(0, 3) ?? [],
    });
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const prices = await getCryptoPrices();
  if (!prices) {
    return NextResponse.json({ error: 'Prices unavailable' }, { status: 502 });
  }

  const { data: alerts, error: alertsError } = await supabase
    .from('price_alerts')
    .select('id, crypto, direction, target_price, email, active')
    .eq('active', true);

  const triggered = selectTriggeredAlerts((alerts as PriceAlertRow[]) || [], prices);
  const sendErrors: string[] = [];

  let sent = 0;
  for (const { alert, price } of triggered) {
    const sym = alert.crypto.toUpperCase();
    const sens = alert.direction === 'above' ? 'au-dessus de' : 'en-dessous de';

    try {
      if (resend) {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: alert.email,
          subject: `Alerte prix ${sym} — seuil atteint`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto">
              <h2 style="color:#534AB7">Alerte de prix Remedly</h2>
              <p>Le cours de <strong>${sym}</strong> est passé ${sens} votre seuil.</p>
              <p style="font-size:20px"><strong>${fmtEur(price)}</strong> (seuil : ${fmtEur(alert.target_price)})</p>
              <p><a href="${SITE_URL}/alertes" style="color:#534AB7">Gérer mes alertes</a></p>
              <p style="color:#888;font-size:12px">Ceci n'est pas un conseil en investissement.</p>
            </div>`,
        });
      }
      // On désactive l'alerte pour ne pas ré-emailer en boucle à chaque cron.
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

  const diag = {
    checked: alerts?.length || 0,
    alertsError: alertsError?.message || null,
    btcPrice: prices['btc'] ?? null,
    resendConfigured: !!resend,
    usingServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    triggered: triggered.length,
    sent,
    sendErrors,
  };
  console.log('CRON check-alerts DIAG', JSON.stringify(diag));
  return NextResponse.json(diag);
}
