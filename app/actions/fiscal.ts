'use server';

import { createClient } from '@supabase/supabase-js';
import { getCryptoPrices } from './prices';
import { computeFiscalReport, EMPTY_REPORT } from '@/lib/fiscal';
import type { FiscalReport, PurchaseRow } from '@/lib/fiscal';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Lit les achats de l'utilisateur puis délègue le calcul à la logique pure
// (lib/fiscal.ts). `onChainQuantities` : quantités réellement détenues on-chain
// par symbole, pour la détection des fonds externes (optionnel).
export async function getFiscalReport(
  privyId?: string | null,
  onChainQuantities?: Record<string, number>
): Promise<FiscalReport> {
  if (!privyId) return EMPTY_REPORT;

  const supabase = getAdminClient();

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('privy_id', privyId)
    .maybeSingle();

  if (!user) return { ...EMPTY_REPORT, generatedAt: new Date().toISOString() };

  const { data: txs } = await supabase
    .from('transactions')
    .select('provider, fiat_amount, crypto_amount, crypto_currency, status, created_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: true });

  const prices = await getCryptoPrices();

  return computeFiscalReport((txs || []) as PurchaseRow[], prices, onChainQuantities);
}
