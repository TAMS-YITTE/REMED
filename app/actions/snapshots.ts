'use server';

import { createClient } from '@supabase/supabase-js';
import { isPro } from './subscription';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export interface PortfolioSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  total_value_eur: number;
  created_at: string;
}

export async function getPortfolioSnapshots(privyId?: string | null): Promise<PortfolioSnapshot[]> {
  if (!privyId) return [];
  const pro = await isPro(privyId);
  if (!pro) return [];

  const supabase = getAdminClient();
  const { data: user } = await supabase.from('users').select('id').eq('privy_id', privyId).maybeSingle();
  if (!user?.id) return [];

  const { data } = await supabase
    .from('portfolio_snapshots')
    .select('id, user_id, snapshot_date, total_value_eur, created_at')
    .eq('user_id', user.id)
    .order('snapshot_date', { ascending: true });

  return (data as PortfolioSnapshot[]) || [];
}
