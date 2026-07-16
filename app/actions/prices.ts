'use server';

import { safeFetch } from './utils';

export type CryptoPrices = Record<string, number>;

export async function getCryptoPrices(): Promise<CryptoPrices | null> {
  try {
    // Top cryptos list + stablecoins
    const ids = [
      'bitcoin', 'ethereum', 'solana', 'ripple', 'usd-coin', 
      'cardano', 'avalanche-2', 'polkadot', 'chainlink', 'dogecoin', 
      'matic-network', 'shiba-inu', 'litecoin', 'uniswap', 'cosmos'
    ].join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur`;
    const data = await safeFetch<any>(url, { next: { revalidate: 60 } }, null);
    
    if (!data) {
      return null;
    }

    const prices: CryptoPrices = {};
    const idToSymbol: Record<string, string> = {
      'bitcoin': 'btc',
      'ethereum': 'eth',
      'solana': 'sol',
      'ripple': 'xrp',
      'usd-coin': 'usdc',
      'cardano': 'ada',
      'avalanche-2': 'avax',
      'polkadot': 'dot',
      'chainlink': 'link',
      'dogecoin': 'doge',
      'matic-network': 'matic',
      'shiba-inu': 'shib',
      'litecoin': 'ltc',
      'uniswap': 'uni',
      'cosmos': 'atom'
    };

    for (const [id, symbol] of Object.entries(idToSymbol)) {
      if (data[id] && data[id].eur) {
        prices[symbol] = data[id].eur;
      }
    }

    return prices;
  } catch (error) {
    console.error('Erreur lors de la récupération des prix:', error);
    return null;
  }
}
