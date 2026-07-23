'use server';

import { createClient } from '@supabase/supabase-js';

const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export async function getSavedWallets(privyId: string) {
  const supabase = getAdminClient();
  // 1. Trouver l'utilisateur
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('privy_id', privyId)
    .single();
    
  if (userError || !user) {
    return [];
  }

  // 2. Trouver ses portefeuilles
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
  // 1. Trouver ou créer l'utilisateur
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

  // 2. Sauvegarder le portefeuille
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

export async function getPurchases(privyId: string) {
  const supabase = getAdminClient();
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('privy_id', privyId)
    .single();

  if (!user) return [];

  const { data: txs, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching purchases:', error);
    return [];
  }

  return txs || [];
}
