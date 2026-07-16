'use server';

import { safeFetch } from './utils';
import type { Transaction, WalletData } from './utils';

export async function getBitcoinWalletData(address: string): Promise<WalletData> {
  const MEMPOOL_API = 'https://mempool.space/testnet/api';

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
          timeStamp: tx.status?.block_time ? tx.status.block_time.toString() : '0'
        };
      });
    }

    return { balanceBtc, transactions };
  } catch (error) {
    console.error("Erreur lors de la récupération des données BTC :", error);
    return { balanceBtc: "0.00", transactions: [] };
  }
}
