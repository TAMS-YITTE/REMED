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

// Synchronise automatiquement les achats passés depuis l'API MoonPay pour toutes les adresses wallet de l'utilisateur.
export async function syncMoonPayTransactionsForUser(privyId: string): Promise<number> {
  if (!privyId) return 0;
  const apiKey = process.env.NEXT_PUBLIC_MOONPAY_KEY || process.env.MOONPAY_SECRET_KEY;
  if (!apiKey) return 0;

  const supabase = getAdminClient();
  const { data: user } = await supabase
    .from('users')
    .select('id, wallet_address, solana_wallet_address, bitcoin_wallet_address')
    .eq('privy_id', privyId)
    .maybeSingle();

  if (!user) return 0;

  const addresses = [
    user.wallet_address,
    user.solana_wallet_address,
    user.bitcoin_wallet_address,
  ].filter(Boolean) as string[];

  let totalSynced = 0;

  for (const address of addresses) {
    try {
      const res = await fetch(`https://api.moonpay.com/v1/transactions?apiKey=${apiKey}&walletAddress=${address}`);
      if (!res.ok) continue;
      const moonpayTxs = await res.json();
      if (!Array.isArray(moonpayTxs)) continue;

      for (const tx of moonpayTxs) {
        if (tx.status === 'completed' && tx.id) {
          const providerRefId = String(tx.id);
          const { data: existing } = await supabase
            .from('transactions')
            .select('id')
            .eq('provider_reference_id', providerRefId)
            .maybeSingle();

          if (!existing) {
            const fiatAmount = tx.baseCurrencyAmount || tx.fiatAmount || 0;
            const fiatCurrency = (tx.baseCurrency?.code || 'EUR').toUpperCase();
            const cryptoAmount = tx.quoteCurrencyAmount || tx.cryptoAmount || 0;
            const cryptoCurrency = (tx.currency?.code || tx.cryptoCurrency || 'ETH').toUpperCase();
            const createdAt = tx.createdAt || new Date().toISOString();

            await supabase.from('transactions').insert([
              {
                user_id: user.id,
                provider: 'moonpay',
                fiat_amount: fiatAmount,
                fiat_currency: fiatCurrency,
                crypto_amount: cryptoAmount,
                crypto_currency: cryptoCurrency,
                wallet_address: address,
                status: 'completed',
                provider_reference_id: providerRefId,
                created_at: createdAt,
              },
            ]);
            totalSynced++;
          }
        }
      }
    } catch (e) {
      console.error(`MoonPay sync error for ${address}:`, e);
    }
  }

  return totalSynced;
}

// Lit les achats de l'utilisateur (par user_id OU par adresses de wallet) avec déduplication stricte.
export async function getFiscalReport(
  privyId?: string | null,
  onChainQuantities?: Record<string, number>
): Promise<FiscalReport> {
  if (!privyId) return EMPTY_REPORT;

  // Tentative de rattrapage automatique des transactions passées sur l'API MoonPay
  await syncMoonPayTransactionsForUser(privyId).catch(console.error);

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
