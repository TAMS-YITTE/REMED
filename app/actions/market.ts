'use server';

import { safeFetch } from './utils';
import * as Sentry from '@sentry/nextjs';

const TIMEOUT_MS = 5000;

export async function getBitcoinRsi(): Promise<number | null> {
  try {
    // Fetch 15 days of daily klines to calculate 14-day RSI
    const url = 'https://api.binance.com/api/v3/klines?symbol=BTCEUR&interval=1d&limit=15';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const data = await safeFetch<any[][] | null>(url, { next: { revalidate: 3600 }, signal: controller.signal }, null);
    clearTimeout(timeoutId);
    
    if (!data || data.length < 15) return null;

    // Binance klines format: [Open time, Open, High, Low, Close, Volume, Close time, ...]
    const closes = data.map(kline => parseFloat(kline[4]));
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= 14; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return Math.round(rsi);
  } catch (error) {
    console.error('Error fetching Binance klinedata:', error);
    Sentry.captureException(error, { tags: { context: 'getBitcoinRsi' } });
    return null; // Fallback failure state
  }
}

export type ChartDataPoint = { time: string; price: number };

export async function getMarketChart(cryptoId: string, days: number = 7): Promise<ChartDataPoint[]> {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=eur&days=${days}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const data = await safeFetch<any | null>(url, { next: { revalidate: 3600 }, signal: controller.signal }, null);
    clearTimeout(timeoutId);
    
    if (!data || !data.prices) return [];
    
    return data.prices.map((item: [number, number]) => {
      const date = new Date(item[0]);
      return {
        time: days <= 1 
          ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) 
          : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        price: item[1]
      };
    });
  } catch (error) {
    console.error('Error fetching market chart data:', error);
    Sentry.captureException(error, { tags: { context: 'getMarketChart' } });
    return [];
  }
}

export async function getMarketTrendsData() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const [fngRes, cgRes, rsi] = await Promise.all([
      fetch('https://api.alternative.me/fng/', { next: { revalidate: 3600 }, signal: controller.signal }),
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=eur&include_24hr_change=true', { next: { revalidate: 60 }, signal: controller.signal }),
      getBitcoinRsi()
    ]);
    clearTimeout(timeoutId);

    const fngData = fngRes.ok ? await fngRes.json() : null;
    const cgData = cgRes.ok ? await cgRes.json() : null;

    // Distinguer un échec silencieux d'une vraie donnée neutre
    return {
      fngValue: fngData ? parseInt(fngData.data[0].value, 10) : null,
      fngClassification: fngData ? fngData.data[0].value_classification : null,
      btcChange: cgData?.bitcoin?.eur_24h_change ?? null,
      ethChange: cgData?.ethereum?.eur_24h_change ?? null,
      solChange: cgData?.solana?.eur_24h_change ?? null,
      rsiValue: rsi
    };
  } catch (err) {
    console.error('Error fetching combined market trends:', err);
    Sentry.captureException(err, { tags: { context: 'getMarketTrendsData' } });
    return {
      fngValue: null,
      fngClassification: null,
      btcChange: null,
      ethChange: null,
      solChange: null,
      rsiValue: null
    };
  }
}
