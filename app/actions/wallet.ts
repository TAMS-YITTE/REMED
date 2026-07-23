'use server';

import { safeFetch } from './utils';
import type { Transaction, WalletData } from './utils';

export async function getWalletData(address: string): Promise<WalletData> {
  const ETHERSCAN_API = 'https://api.etherscan.io/api';
  const API_KEY = process.env.ETHERSCAN_API_KEY || '';
  
  try {
    const balanceData = await safeFetch<any>(
      `${ETHERSCAN_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEY}`,
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
      `${ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${API_KEY}`,
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

export async function getErc20Balances(address: string) {
  const ETHERSCAN_API = 'https://api-sepolia.etherscan.io/api';
  const API_KEY = process.env.ETHERSCAN_API_KEY || '';
  
  const tokens = [
    { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
    { symbol: 'LINK', address: '0x514910771af9ca656af840dff83e8264ecf986ca', decimals: 18 },
    { symbol: 'SHIB', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', decimals: 18 },
    { symbol: 'UNI', address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 18 },
    { symbol: 'POL', address: '0x455e53c3ee1528c586b7215de5f832f05929a6b2', decimals: 18 }
  ];

  const balances: Record<string, string> = {};

  try {
    await Promise.all(tokens.map(async (token) => {
      const data = await safeFetch<any>(
        `${ETHERSCAN_API}?module=account&action=tokenbalance&contractaddress=${token.address}&address=${address}&tag=latest&apikey=${API_KEY}`,
        { next: { revalidate: 10 } },
        null
      );
      if (data?.status === "1" && data?.result) {
        const value = Number(data.result) / (10 ** token.decimals);
        balances[token.symbol] = value > 0 ? value.toFixed(4) : "0.00";
      } else {
        balances[token.symbol] = "0.00";
      }
    }));
  } catch (err) {
    console.error("Erreur lors de la récupération des tokens ERC20 :", err);
  }
  try {
    const SNOWTRACE_API = 'https://api.snowtrace.io/api';
    const SNOWTRACE_KEY = process.env.SNOWTRACE_API_KEY || '';
    const avaxData = await safeFetch<any>(
      `${SNOWTRACE_API}?module=account&action=balance&address=${address}&tag=latest&apikey=${SNOWTRACE_KEY}`,
      { next: { revalidate: 10 } },
      null
    );
    if (avaxData?.status === "1" && avaxData?.result) {
      const wei = BigInt(avaxData.result);
      const avaxVal = Number(wei / BigInt(10 ** 14)) / 10000;
      balances['AVAX'] = avaxVal > 0 ? avaxVal.toFixed(4) : "0.00";
    } else {
      balances['AVAX'] = "0.00";
    }
  } catch (err) {
    console.error("Erreur lors de la récupération de AVAX via Snowtrace :", err);
    balances['AVAX'] = "0.00";
  }

  return balances;
}
