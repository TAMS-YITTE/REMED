'use server';

import { safeFetch } from './utils';
import type { Transaction, WalletData } from './utils';

// L'API Etherscan V1 a été fermée (elle répond "deprecated V1 endpoint" sur
// tous les appels), ce qui renvoyait systématiquement des soldes à zéro.
// Les soldes passent désormais par un RPC public, qui ne demande aucune clé.
// Seul l'historique des transactions a besoin d'un indexeur : Etherscan V2,
// qui exige ETHERSCAN_API_KEY (sans clé, l'historique reste simplement vide).
const ETHEREUM_RPC = 'https://ethereum-rpc.publicnode.com';
const AVALANCHE_RPC = 'https://api.avax.network/ext/bc/C/rpc';
const ETHERSCAN_API = 'https://api.etherscan.io/v2/api';

type RpcCall = { method: string; params: unknown[] };

// Un seul aller-retour HTTP pour N appels (JSON-RPC batch), pour éviter de se
// faire limiter par le RPC public sur les 5 tokens ERC-20.
async function rpcBatch(url: string, calls: RpcCall[]): Promise<(string | null)[]> {
  const payload = calls.map((call, id) => ({ jsonrpc: '2.0', id, ...call }));

  const res = await safeFetch<any>(url, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, null);

  if (!Array.isArray(res)) {
    return calls.map(() => null);
  }

  const byId = new Map<number, any>(res.map((entry: any) => [entry?.id, entry]));
  return calls.map((_, id) => {
    const result = byId.get(id)?.result;
    return typeof result === 'string' ? result : null;
  });
}

// Convertit un montant hexadécimal en unité lisible, avec 4 décimales.
// On divise en BigInt avant de repasser en Number pour ne pas dépasser
// la précision d'un flottant sur les tokens à 18 décimales.
function fromHex(hex: string | null, decimals: number): number {
  if (!hex) return 0;
  try {
    const raw = BigInt(hex);
    const kept = Math.min(decimals, 4);
    const scale = BigInt(10) ** BigInt(decimals - kept);
    return Number(raw / scale) / 10 ** kept;
  } catch {
    return 0;
  }
}

// Encodage de l'appel ERC-20 balanceOf(address)
function balanceOfCall(contract: string, address: string): RpcCall {
  const padded = address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  return {
    method: 'eth_call',
    params: [{ to: contract, data: `0x70a08231${padded}` }, 'latest']
  };
}

export async function getWalletData(address: string): Promise<WalletData> {
  try {
    const [balanceHex] = await rpcBatch(ETHEREUM_RPC, [
      { method: 'eth_getBalance', params: [address, 'latest'] }
    ]);

    const balanceEth = fromHex(balanceHex, 18).toFixed(4);

    const API_KEY = process.env.ETHERSCAN_API_KEY || '';
    let transactions: Transaction[] = [];

    if (!API_KEY) {
      console.warn("ETHERSCAN_API_KEY absente : l'historique des transactions ETH sera vide.");
    } else {
      const txData = await safeFetch<any>(
        `${ETHERSCAN_API}?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc&apikey=${API_KEY}`,
        { next: { revalidate: 10 } },
        null
      );

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
    }

    return { balanceEth, transactions };
  } catch (error) {
    console.error("Erreur lors de la récupération des données ETH :", error);
    return { balanceEth: "0.00", transactions: [] };
  }
}

export async function getErc20Balances(address: string) {
  const tokens = [
    { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
    { symbol: 'LINK', address: '0x514910771af9ca656af840dff83e8264ecf986ca', decimals: 18 },
    { symbol: 'SHIB', address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', decimals: 18 },
    { symbol: 'UNI', address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 18 },
    { symbol: 'POL', address: '0x455e53c3ee1528c586b7215de5f832f05929a6b2', decimals: 18 }
  ];

  const balances: Record<string, string> = {};

  try {
    const results = await rpcBatch(
      ETHEREUM_RPC,
      tokens.map((token) => balanceOfCall(token.address, address))
    );

    tokens.forEach((token, i) => {
      const value = fromHex(results[i], token.decimals);
      balances[token.symbol] = value > 0 ? value.toFixed(4) : "0.00";
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des tokens ERC20 :", err);
    tokens.forEach((token) => {
      balances[token.symbol] = "0.00";
    });
  }

  // AVAX : la C-Chain n'est pas couverte par le plan gratuit d'Etherscan V2,
  // on lit donc le solde directement sur le RPC public Avalanche.
  try {
    const [avaxHex] = await rpcBatch(AVALANCHE_RPC, [
      { method: 'eth_getBalance', params: [address, 'latest'] }
    ]);
    const avaxVal = fromHex(avaxHex, 18);
    balances['AVAX'] = avaxVal > 0 ? avaxVal.toFixed(4) : "0.00";
  } catch (err) {
    console.error("Erreur lors de la récupération du solde AVAX :", err);
    balances['AVAX'] = "0.00";
  }

  return balances;
}
