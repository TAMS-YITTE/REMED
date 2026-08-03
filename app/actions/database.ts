'use server';

import { createClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  return createClient(
    url,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock_key'
  );
};

export async function syncUserWallets(
  privyId: string,
  addresses: { eth?: string; sol?: string; btc?: string; email?: string }
): Promise<void> {
  if (!privyId) return;

  const supabase = getAdminClient();
  if (!supabase) return;

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, wallet_address, solana_wallet_address, bitcoin_wallet_address, email')
    .eq('privy_id', privyId)
    .maybeSingle();

  const updateFields: Record<string, any> = {};

  if (addresses.eth && addresses.eth !== existingUser?.wallet_address) {
    updateFields.wallet_address = addresses.eth;
  }
  if (addresses.sol && addresses.sol !== existingUser?.solana_wallet_address) {
    updateFields.solana_wallet_address = addresses.sol;
  }
  if (addresses.btc && addresses.btc !== existingUser?.bitcoin_wallet_address) {
    updateFields.bitcoin_wallet_address = addresses.btc;
  }
  if (addresses.email && addresses.email !== existingUser?.email) {
    updateFields.email = addresses.email;
  }

  if (Object.keys(updateFields).length === 0 && existingUser) {
    return;
  }

  if (existingUser) {
    await supabase.from('users').update(updateFields).eq('id', existingUser.id);
  } else {
    await supabase.from('users').insert([
      {
        privy_id: privyId,
        wallet_address: addresses.eth || null,
        solana_wallet_address: addresses.sol || null,
        bitcoin_wallet_address: addresses.btc || null,
        email: addresses.email || null,
      },
    ]);
  }
}

export async function updateWeeklyDigestPreference(
  privyId: string,
  enabled: boolean
): Promise<{ ok: boolean }> {
  if (!privyId) return { ok: false };
  const supabase = getAdminClient();
  if (!supabase) return { ok: false };

  const { error } = await supabase
    .from('users')
    .update({ weekly_digest: enabled })
    .eq('privy_id', privyId);
  return { ok: !error };
}

export async function getSavedWallets(privyId: string) {
  const supabase = getAdminClient();
  if (!supabase) return [];

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('privy_id', privyId)
    .single();

  if (userError || !user) {
    return [];
  }

  const { data: wallets, error } = await supabase
    .from('saved_wallets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wallets:', error);
    return [];
  }

  return wallets || [];
}

export async function saveWallet(privyId: string, address: string, network: string, label: string) {
  const supabase = getAdminClient();
  if (!supabase) return null;

  let { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('privy_id', privyId)
    .single();

  if (!user) {
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ privy_id: privyId }])
      .select()
      .single();

    if (createError) throw createError;
    user = newUser;
  }

  if (!user) return null;

  const { data, error } = await supabase
    .from('saved_wallets')
    .insert([
      { user_id: user.id, address, network, label }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPurchases(privyId: string, walletAddress?: string) {
  const supabase = getAdminClient();
  if (!supabase) return [];

  const { data: user } = await supabase
    .from('users')
    .select('id, wallet_address, solana_wallet_address, bitcoin_wallet_address')
    .eq('privy_id', privyId)
    .maybeSingle();

  const addresses = Array.from(new Set([
    walletAddress,
    user?.wallet_address,
    user?.solana_wallet_address,
    user?.bitcoin_wallet_address,
  ].filter(Boolean))) as string[];

  let query = supabase.from('transactions').select('*');

  if (user && addresses.length > 0) {
    const addrFilters = addresses.map((a) => `wallet_address.eq.${a}`).join(',');
    query = query.or(`user_id.eq.${user.id},${addrFilters}`);
  } else if (user) {
    query = query.eq('user_id', user.id);
  } else if (addresses.length > 0) {
    const addrFilters = addresses.map((a) => `wallet_address.eq.${a}`).join(',');
    query = query.or(addrFilters);
  } else {
    return [];
  }

  const { data: txs, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }

  const seenKeys = new Set<string>();
  const deduplicated: any[] = [];
  for (const t of txs || []) {
    const key = t.provider_reference_id
      ? `ref_${t.provider_reference_id}`
      : t.id
      ? `id_${t.id}`
      : `content_${t.created_at}_${t.crypto_currency}_${t.crypto_amount}_${t.fiat_amount}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      deduplicated.push(t);
    }
  }

  return deduplicated;
}
