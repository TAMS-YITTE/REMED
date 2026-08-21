'use server';

import { safeFetch } from './utils';
import type { Transaction, WalletData } from './utils';

export async function getBitcoinWalletData(address: string): Promise<WalletData> {
  const MEMPOOL_API = 'https://mempool.space/api';

  try {
    // 1. Fetch balance (funded_txo_sum - spent_txo_sum)
    const addressData = await safeFetch<any>(
      `${MEMPOOL_API}/address/${address}`,
      { next: { revalidate: 10 } },
      null
    );

    let balanceBtc = "0.00";
    if (addressData?.chain_stats) {
      const funded = Number(addressData.chain_stats.funded_txo_sum || 0);
      const spent = Number(addressData.chain_stats.spent_txo_sum || 0);
      const satoshis = funded - spent;
      balanceBtc = (satoshis / 10**8).toFixed(5);
    }

    // 2. Fetch last 5 transactions
    const txData = await safeFetch<any[]>(
      `${MEMPOOL_API}/address/${address}/txs`,
      { next: { revalidate: 10 } },
      []
    );

    let transactions: Transaction[] = [];
    if (Array.isArray(txData)) {
      transactions = txData.slice(0, 5).map((tx: any) => {
        // Calculate value change for this address to determine if received/sent
        let valueDiff = 0;
        
        // Subtract inputs from this address
        if (Array.isArray(tx.vin)) {
          tx.vin.forEach((vin: any) => {
            if (vin.prevout && vin.prevout.scriptpubkey_address === address) {
              valueDiff -= vin.prevout.value;
            }
          });
        }

        // Add outputs to this address
        if (Array.isArray(tx.vout)) {
          tx.vout.forEach((vout: any) => {
            if (vout.scriptpubkey_address === address) {
              valueDiff += vout.value;
            }
          });
        }

        return {
          hash: tx.txid,
          from: valueDiff > 0 ? 'Bitcoin Network' : address,
          to: valueDiff < 0 ? 'Bitcoin Network' : address,
          value: Math.abs(valueDiff).toString(),
          timeStamp: tx.status?.block_time ? tx.status.block_time.toString() : '0',
          chain: 'bitcoin'
        };
      });
    }

    return { balanceBtc, transactions };
  } catch (error) {
    console.error("Erreur lors de la récupération des données BTC :", error);
    return { balanceBtc: "0.00", transactions: [] };
  }
}

// --- Envoi ---
// Privy ne sait que signer un hash pour Bitcoin : la composition et la
// diffusion de la transaction sont à notre charge.

export interface BitcoinUtxo {
  txid: string;
  vout: number;
  value: number;
}

export async function getBitcoinUtxos(address: string): Promise<BitcoinUtxo[]> {
  const utxos = await safeFetch<any[]>(
    `https://mempool.space/api/address/${address}/utxo`,
    { cache: 'no-store' },
    []
  );
  if (!Array.isArray(utxos)) return [];

  // Une entrée non confirmée peut disparaître d'une réorganisation : on ne
  // dépense que du confirmé.
  return utxos
    .filter((u) => u?.status?.confirmed && Number.isFinite(u.value))
    .map((u) => ({ txid: u.txid, vout: u.vout, value: Number(u.value) }));
}

export interface BitcoinFeeRates {
  economique: number;
  normal: number;
  rapide: number;
}

export async function getBitcoinFeeRates(): Promise<BitcoinFeeRates> {
  const fees = await safeFetch<any>(
    'https://mempool.space/api/v1/fees/recommended',
    { cache: 'no-store' },
    null
  );

  // Sous-estimer les frais fait rejeter la transaction : à défaut de
  // réponse, on retient des valeurs prudentes plutôt que zéro.
  const read = (value: unknown, fallback: number) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  // Marge de +1 sat/vB : le débit du réseau peut monter entre la
  // préparation de la transaction et sa diffusion. C'est exactement ce qui
  // a laissé une transaction coincée plusieurs heures à 1,05 sat/vB alors
  // que le réseau était passé à 4.
  return {
    economique: read(fees?.hourFee, 3) + 1,
    normal: read(fees?.halfHourFee, 5) + 1,
    rapide: read(fees?.fastestFee, 10) + 1,
  };
}

export async function broadcastBitcoinTransaction(
  txHex: string
): Promise<{ txid: string } | { error: string }> {
  try {
    const res = await fetch('https://mempool.space/api/tx', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: txHex,
    });
    const body = (await res.text()).trim();
    // mempool.space renvoie le txid en clair, ou le motif du refus.
    if (!res.ok) return { error: body || `Diffusion refusée (HTTP ${res.status}).` };
    if (!/^[0-9a-f]{64}$/i.test(body)) return { error: body || 'Réponse inattendue du réseau Bitcoin.' };
    return { txid: body };
  } catch (error) {
    console.error('Erreur lors de la diffusion BTC :', error);
    return { error: 'Réseau Bitcoin injoignable au moment de la diffusion.' };
  }
}
