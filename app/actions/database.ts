'use server';

import { createClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export async function syncUserWallets(
  privyId: string,
  addresses: { eth?: string; sol?: string; btc?: string; email?: string }
): Promise<void> {
  if (!privyId) return;

  const supabase = getAdminClient();
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
  const { error } = await supabase
    .from('users')
    .update({ weekly_digest: enabled })
    .eq('privy_id', privyId);
  return { ok: !error };
}

export async function getSavedWallets(privyId: string) {
  const supabase = getAdminClient();
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
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('privy_id', privyId)
    .single();

  let query = supabase.from('transactions').select('*');

  if (user && walletAddress) {
    query = query.or(`user_id.eq.${user.id},wallet_address.eq.${walletAddress}`);
  } else if (user) {
    query = query.eq('user_id', user.id);
  } else if (walletAddress) {
    query = query.eq('wallet_address', walletAddress);
  } else {
    return [];
  }

  const { data: txs, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }

  return txs || [];
}
