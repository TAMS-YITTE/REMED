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

// Lit les achats de l'utilisateur (par user_id OU par adresses de wallet) avec déduplication stricte.
export async function getFiscalReport(
  privyId?: string | null,
  onChainQuantities?: Record<string, number>
): Promise<FiscalReport> {
  if (!privyId) return EMPTY_REPORT;

  const supabase = getAdminClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, wallet_address, solana_wallet_address, bitcoin_wallet_address')
    .eq('privy_id', privyId)
    .maybeSingle();

  if (!user) return { ...EMPTY_REPORT, generatedAt: new Date().toISOString() };

  const addresses = [
    user.wallet_address,
    user.solana_wallet_address,
    user.bitcoin_wallet_address,
  ].filter(Boolean) as string[];

  let query = supabase
    .from('transactions')
    .select('id, provider, fiat_amount, crypto_amount, crypto_currency, status, provider_reference_id, created_at');

  if (addresses.length > 0) {
    const addrFilters = addresses.map((a) => `wallet_address.eq.${a}`).join(',');
    query = query.or(`user_id.eq.${user.id},${addrFilters}`);
  } else {
    query = query.eq('user_id', user.id);
  }

  const { data: txs } = await query.order('created_at', { ascending: true });

  const validTxs = (txs || []).filter((t: any) => !t.status || t.status === 'completed' || t.status === 'success');

  // Déduplication stricte : si provider_reference_id ou id identique, ou même date/montant/quantité
  const seenKeys = new Set<string>();
  const deduplicatedTxs: PurchaseRow[] = [];

  for (const t of validTxs) {
    const key = t.provider_reference_id
      ? `ref_${t.provider_reference_id}`
      : t.id
      ? `id_${t.id}`
      : `content_${t.created_at}_${t.crypto_currency}_${t.crypto_amount}_${t.fiat_amount}`;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      deduplicatedTxs.push(t as PurchaseRow);
    }
  }

  const prices = await getCryptoPrices();

  return computeFiscalReport(deduplicatedTxs, prices, onChainQuantities);
}
