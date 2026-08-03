'use server';

import { safeFetch } from './utils';

export type CryptoPrices = Record<string, number>;

export interface CryptoMarketData {
  price: number;
  change24h: number;
}

export type CryptoMarketDataMap = Record<string, CryptoMarketData>;

export async function getCryptoPrices(): Promise<CryptoPrices | null> {
  try {
    const market = await getCryptoMarketData();
    if (!market) return null;

    const prices: CryptoPrices = {};
    for (const [symbol, data] of Object.entries(market)) {
      prices[symbol] = data.price;
    }
    return prices;
  } catch (error) {
    console.error('Erreur lors de la récupération des prix:', error);
    return null;
  }
}

export async function getCryptoMarketData(): Promise<CryptoMarketDataMap | null> {
  try {
    const ids = [
      'bitcoin', 'ethereum', 'solana', 'ripple', 'usd-coin', 
      'cardano', 'avalanche-2', 'polkadot', 'chainlink', 'dogecoin', 
      'matic-network', 'shiba-inu', 'litecoin', 'uniswap', 'cosmos'
    ].join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true`;
    const data = await safeFetch<any>(url, { next: { revalidate: 60 } }, null);
    
    if (!data) return null;

    const marketData: CryptoMarketDataMap = {};
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
      if (data[id] && data[id].eur != null) {
        marketData[symbol] = {
          price: data[id].eur,
          change24h: data[id].eur_24h_change ?? 0,
        };
      }
    }

    return marketData;
  } catch (error) {
    console.error('Erreur lors de la récupération des données de marché:', error);
    return null;
  }
}
