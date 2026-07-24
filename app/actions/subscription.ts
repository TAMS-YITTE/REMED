'use server';

import { createClient } from '@supabase/supabase-js';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export interface SubscriptionStatus {
  active: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const INACTIVE: SubscriptionStatus = {
  active: false,
  status: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

// Source de vérité de l'accès Premium, côté serveur. À appeler dans les
// server actions / server components qui protègent une ressource Pro —
// ne jamais se fier au seul état client, qui est falsifiable.
export async function getSubscriptionStatus(privyId?: string | null): Promise<SubscriptionStatus> {
  if (!privyId) return INACTIVE;

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, current_period_end, cancel_at_period_end')
    .eq('privy_id', privyId)
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return INACTIVE;

  // Un abonnement donne accès s'il est actif (ou en essai) ET non expiré.
  const okStatus = data.status === 'active' || data.status === 'trialing';
  const notExpired = data.current_period_end
    ? new Date(data.current_period_end).getTime() > Date.now()
    : okStatus; // si la date manque, on se fie au statut

  return {
    active: okStatus && notExpired,
    status: data.status,
    currentPeriodEnd: data.current_period_end,
    cancelAtPeriodEnd: data.cancel_at_period_end ?? false,
  };
}

export async function isPro(privyId?: string | null): Promise<boolean> {
  return (await getSubscriptionStatus(privyId)).active;
}
