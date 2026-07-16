'use server';

import { safeFetch } from './utils';

export interface CryptoPrices {
  eth: number;
  sol: number;
  btc: number;
}

export async function getCryptoPrices(): Promise<CryptoPrices | null> {
  try {
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana,bitcoin&vs_currencies=eur';
    const data = await safeFetch<any>(url, { next: { revalidate: 60 } }, null);
    
    if (!data || !data.ethereum || !data.solana || !data.bitcoin) {
      return null;
    }

    return {
      eth: data.ethereum.eur,
      sol: data.solana.eur,
      btc: data.bitcoin.eur,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des prix:', error);
    return null;
  }
}
