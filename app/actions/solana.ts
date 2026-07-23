'use server';

import { safeFetch } from './utils';
import type { Transaction, WalletData } from './utils';

export async function getSolanaWalletData(address: string): Promise<WalletData> {
  const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

  try {
    // 1. Fetch balance
    const balanceReq = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [address],
    };

    const balanceRes = await safeFetch<any>(SOLANA_RPC, {
      method: 'POST',
      body: JSON.stringify(balanceReq)
    }, null);

    let balanceSol = "0.00";
    if (balanceRes?.result?.value !== undefined) {
      const lamports = Number(balanceRes.result.value);
      balanceSol = (lamports / 10**9).toFixed(4);
    }

    // 2. Fetch simple transactions history
    const txReq = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [
        address,
        { limit: 5 }
      ]
    };

    const txRes = await safeFetch<any>(SOLANA_RPC, {
      method: 'POST',
      body: JSON.stringify(txReq)
    }, null);

    let transactions: Transaction[] = [];
    if (Array.isArray(txRes?.result)) {
      transactions = txRes.result.map((tx: any) => ({
        hash: tx.signature,
        from: tx.err ? 'Erreur' : 'Solana Network',
        to: address,
        value: '0',
        timeStamp: tx.blockTime ? tx.blockTime.toString() : '0',
        chain: 'solana'
      }));
    }

    return { balanceSol, transactions };
  } catch (error) {
    console.error("Erreur lors de la récupération des données SOL :", error);
    return { balanceSol: "0.00", transactions: [] };
  }
}
