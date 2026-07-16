'use server';

import { safeFetch } from './utils';
import type { Transaction, WalletData } from './utils';

export async function getWalletData(address: string): Promise<WalletData> {
  const ETHERSCAN_API = 'https://api-sepolia.etherscan.io/api';
  
  try {
    const balanceData = await safeFetch<any>(
      `${ETHERSCAN_API}?module=account&action=balance&address=${address}&tag=latest`,
      { next: { revalidate: 10 } },
      null
    );
    
    let balanceEth = "0.00";
    if (balanceData?.status === "1" && balanceData?.result) {
      const wei = BigInt(balanceData.result);
      const ethVal = Number(wei / BigInt(10 ** 14)) / 10000;
      balanceEth = ethVal.toFixed(4);
    }

    const txData = await safeFetch<any>(
      `${ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc`,
      { next: { revalidate: 10 } },
      null
    );
    
    let transactions: Transaction[] = [];
    if (txData?.status === "1" && Array.isArray(txData?.result)) {
      transactions = txData.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timeStamp: tx.timeStamp,
        chain: 'ethereum'
      }));
    }

    return { balanceEth, transactions };
  } catch (error) {
    console.error("Erreur lors de la récupération des données ETH :", error);
    return { balanceEth: "0.00", transactions: [] };
  }
}
