'use server';

import { safeFetch } from './utils';
import * as Sentry from '@sentry/nextjs';

const TIMEOUT_MS = 5000;

export async function getBitcoinRsi(): Promise<number | null> {
  try {
    // Binance (utilisé précédemment) bloque structurellement les requêtes
    // depuis les IP de datacenter/cloud (Vercel inclus) : le RSI restait
    // en permanence "Indisponible" en prod. On recalcule depuis CoinGecko
    // (déjà utilisé et fonctionnel pour getMarketChart), en ramenant la
    // série horaire à une clôture par jour calendaire.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const url = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=eur&days=20';
    const data = await safeFetch<any | null>(url, { next: { revalidate: 3600 }, signal: controller.signal }, null);
    clearTimeout(timeoutId);

    if (!data || !data.prices) return null;

    const dailyCloses = new Map<string, number>();
    for (const [timestamp, price] of data.prices as [number, number][]) {
      const day = new Date(timestamp).toISOString().slice(0, 10);
      dailyCloses.set(day, price); // le dernier prix du jour écrase les précédents
    }
    const closes = Array.from(dailyCloses.values());
    if (closes.length < 15) return null;
    const last15 = closes.slice(-15);

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= 14; i++) {
      const change = last15[i] - last15[i - 1];
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
    console.error('Error computing RSI from CoinGecko data:', error);
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
