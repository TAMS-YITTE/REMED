'use server';

import { createClient } from '@supabase/supabase-js';
import { isPro } from './subscription';
import type { AlertDirection } from '@/lib/alerts';
import { selectTriggeredAlerts, type PriceAlertRow } from '@/lib/alerts';
import { getCryptoMarketData } from './prices';
import { resend, EMAIL_FROM } from '@/lib/email';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export type AlertType = 'threshold' | 'change_24h';

export interface PriceAlert {
  id: string;
  crypto: string;
  direction: AlertDirection;
  target_price: number;
  alert_type?: AlertType;
  active: boolean;
  triggered_at: string | null;
  created_at: string;
}

async function ensureUserId(privyId: string): Promise<string | null> {
  const supabase = getAdminClient();
  const { data: user } = await supabase.from('users').select('id').eq('privy_id', privyId).maybeSingle();
  if (user) return user.id;
  const { data: created } = await supabase.from('users').insert([{ privy_id: privyId }]).select('id').single();
  return created?.id ?? null;
}

export async function getPriceAlerts(privyId?: string | null): Promise<PriceAlert[]> {
  if (!privyId) return [];
  const supabase = getAdminClient();
  const { data } = await supabase
    .from('price_alerts')
    .select('id, crypto, direction, target_price, alert_type, active, triggered_at, created_at')
    .eq('privy_id', privyId)
    .order('created_at', { ascending: false });

  // Évaluation immédiate des alertes au chargement
  checkPriceAlertsNow().catch((e) => console.error('Error auto checking alerts:', e));

  return (data as PriceAlert[]) || [];
}

export async function checkPriceAlertsNow(): Promise<{ checked: number; sent: number }> {
  try {
    const marketData = await getCryptoMarketData();
    if (!marketData) return { checked: 0, sent: 0 };

    const supabase = getAdminClient();
    const { data: alerts } = await supabase
      .from('price_alerts')
      .select('id, crypto, direction, target_price, alert_type, email, active')
      .eq('active', true);

    if (!alerts || alerts.length === 0) return { checked: 0, sent: 0 };

    const triggered = selectTriggeredAlerts((alerts as PriceAlertRow[]) || [], marketData);
    let sent = 0;

    for (const { alert, value } of triggered) {
      const sym = alert.crypto.toUpperCase();
      const is24h = alert.alert_type === 'change_24h';
      const sens = alert.direction === 'above' ? 'au-dessus de' : 'en-dessous de';
      const formattedVal = is24h ? `${value.toFixed(2)} %` : `${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
      const targetVal = is24h ? `${alert.target_price} %` : `${alert.target_price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;

      if (resend && alert.email) {
        try {
          await resend.emails.send({
            from: EMAIL_FROM,
            to: alert.email,
            subject: `Alerte ${is24h ? 'variation 24h' : 'prix'} ${sym} — seuil atteint`,
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:auto">
                <h2 style="color:#534AB7">Alerte Remedly Pro</h2>
                <p>Le cours ou la variation 24h de <strong>${sym}</strong> est passé(e) ${sens} votre seuil.</p>
                <p style="font-size:20px"><strong>${formattedVal}</strong> (seuil configuré : ${targetVal})</p>
                <p><a href="https://www.remedly.fr/alertes" style="color:#534AB7">Gérer mes alertes</a></p>
                <p style="color:#888;font-size:12px">Ceci n'est pas un conseil en investissement.</p>
              </div>`,
          });
        } catch (mailErr) {
          console.error(`Échec envoi mail alerte ${alert.id}:`, mailErr);
        }
      }
      await supabase
        .from('price_alerts')
        .update({ active: false, triggered_at: new Date().toISOString() })
        .eq('id', alert.id);
      sent++;
    }

    return { checked: alerts.length, sent };
  } catch (e) {
    console.error('Error in checkPriceAlertsNow:', e);
    return { checked: 0, sent: 0 };
  }
}

export async function createPriceAlert(
  privyId: string,
  email: string,
  crypto: string,
  direction: AlertDirection,
  targetPrice: number,
  alertType: AlertType = 'threshold'
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isPro(privyId))) {
    return { ok: false, error: 'Réservé aux abonnés Remedly Pro.' };
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: 'Email invalide.' };
  }
  if (!crypto || (direction !== 'above' && direction !== 'below')) {
    return { ok: false, error: 'Paramètres invalides.' };
  }
  if (isNaN(targetPrice) || targetPrice === 0) {
    return { ok: false, error: 'Le seuil doit être un nombre valide.' };
  }

  const userId = await ensureUserId(privyId);
  const supabase = getAdminClient();
  const { error } = await supabase.from('price_alerts').insert([
    {
      user_id: userId,
      privy_id: privyId,
      email,
      crypto: crypto.toLowerCase(),
      direction,
      target_price: targetPrice,
      alert_type: alertType,
      active: true,
    },
  ]);
  if (error) {
    console.error('createPriceAlert error', error);
    return { ok: false, error: "Impossible de créer l'alerte." };
  }

  // Évaluer immédiatement après création
  checkPriceAlertsNow().catch((e) => console.error('Error checking alerts post-creation:', e));

  return { ok: true };
}

export async function deletePriceAlert(privyId: string, alertId: string): Promise<{ ok: boolean }> {
  if (!privyId || !alertId) return { ok: false };
  const supabase = getAdminClient();
  const { error } = await supabase.from('price_alerts').delete().eq('id', alertId).eq('privy_id', privyId);
  return { ok: !error };
}
