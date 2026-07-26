'use server';

import { createClient } from '@supabase/supabase-js';
import { isPro } from './subscription';
import type { AlertDirection } from '@/lib/alerts';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export interface PriceAlert {
  id: string;
  crypto: string;
  direction: AlertDirection;
  target_price: number;
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
    .select('id, crypto, direction, target_price, active, triggered_at, created_at')
    .eq('privy_id', privyId)
    .order('created_at', { ascending: false });
  return (data as PriceAlert[]) || [];
}

export async function createPriceAlert(
  privyId: string,
  email: string,
  crypto: string,
  direction: AlertDirection,
  targetPrice: number
): Promise<{ ok: boolean; error?: string }> {
  // Gating Premium côté serveur — autorité, pas juste l'UI.
  if (!(await isPro(privyId))) {
    return { ok: false, error: 'Réservé aux abonnés Remedly Pro.' };
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: 'Email invalide.' };
  }
  if (!crypto || (direction !== 'above' && direction !== 'below')) {
    return { ok: false, error: 'Paramètres invalides.' };
  }
  if (!(targetPrice > 0)) {
    return { ok: false, error: 'Le seuil doit être supérieur à 0.' };
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
      active: true,
    },
  ]);
  if (error) {
    console.error('createPriceAlert error', error);
    return { ok: false, error: "Impossible de créer l'alerte." };
  }
  return { ok: true };
}

export async function deletePriceAlert(privyId: string, alertId: string): Promise<{ ok: boolean }> {
  if (!privyId || !alertId) return { ok: false };
  const supabase = getAdminClient();
  // On restreint la suppression aux alertes de l'utilisateur.
  const { error } = await supabase.from('price_alerts').delete().eq('id', alertId).eq('privy_id', privyId);
  return { ok: !error };
}
