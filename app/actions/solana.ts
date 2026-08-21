'use server';

import { safeFetch } from './utils';
import type { Transaction, WalletData } from './utils';

// getSignaturesForAddress ne renvoie que des signatures, jamais de montant :
// c'est pour ça que chaque ligne de l'historique SOL affichait "+0 SOL".
// Le montant réel se lit sur getTransaction, en comparant preBalances et
// postBalances à l'index de l'adresse dans accountKeys.
// Le RPC public est fortement limité en débit ; SOLANA_RPC_URL permet de
// pointer vers un fournisseur dédié sans toucher au code.
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const HISTORY_LIMIT = 5;

type SignatureEntry = {
  signature: string;
  blockTime?: number | null;
  err?: unknown;
};

function getTransactionCall(signature: string, id: number) {
  return {
    jsonrpc: '2.0',
    id,
    method: 'getTransaction',
    params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
  };
}

// Variation de solde en lamports pour `address` dans une réponse getTransaction.
// `null` = la réponse ne porte pas l'information ; on ne fabrique surtout pas
// un 0, qui se lirait comme un vrai montant nul.
function lamportDelta(result: any, address: string): number | null {
  const keys = result?.transaction?.message?.accountKeys;
  const pre = result?.meta?.preBalances;
  const post = result?.meta?.postBalances;
  if (!Array.isArray(keys) || !Array.isArray(pre) || !Array.isArray(post)) return null;

  // En encodage jsonParsed, accountKeys inclut aussi les adresses chargées
  // via address lookup table : l'index correspond donc bien à celui des
  // tableaux pre/postBalances.
  const index = keys.findIndex(
    (key: any) => (typeof key === 'string' ? key : key?.pubkey) === address
  );
  if (index < 0 || pre[index] === undefined || post[index] === undefined) return null;

  return Number(post[index]) - Number(pre[index]);
}

async function fetchLamportDeltas(
  signatures: string[],
  address: string
): Promise<Map<string, number | null>> {
  const deltas = new Map<string, number | null>(signatures.map((sig) => [sig, null]));
  if (signatures.length === 0) return deltas;

  // Chemin rapide : un seul aller-retour HTTP pour N appels (JSON-RPC batch).
  const res = await safeFetch<any>(SOLANA_RPC, {
    method: 'POST',
    body: JSON.stringify(signatures.map(getTransactionCall))
  }, null);

  if (Array.isArray(res)) {
    const byId = new Map<number, any>(res.map((entry: any) => [entry?.id, entry]));
    signatures.forEach((signature, id) => {
      deltas.set(signature, lamportDelta(byId.get(id)?.result, address));
    });
    return deltas;
  }

  // Certains RPC refusent les batchs (publicnode : "Maximum number of
  // 'getTransaction' calls in a batch request is 1"). Plutôt que de renvoyer
  // des montants vides, on repasse en appels séparés — plus lents, mais
  // l'historique est court.
  const single = await Promise.all(
    signatures.map((signature) =>
      safeFetch<any>(SOLANA_RPC, {
        method: 'POST',
        body: JSON.stringify(getTransactionCall(signature, 1))
      }, null)
    )
  );

  signatures.forEach((signature, i) => {
    deltas.set(signature, lamportDelta(single[i]?.result, address));
  });

  return deltas;
}

// Un virement SOL doit porter un blockhash récent (validité ~60-90 s).
// On le lit côté serveur pour rester sur le même RPC que le reste, sans
// exposer d'endpoint au navigateur.
export async function getSolanaBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: string } | null> {
  const res = await safeFetch<any>(SOLANA_RPC, {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getLatestBlockhash',
      params: [{ commitment: 'finalized' }]
    })
  }, null);

  const value = res?.result?.value;
  if (!value?.blockhash || value.lastValidBlockHeight === undefined) return null;

  // lastValidBlockHeight dépasse la précision sûre d'un Number côté client :
  // on le transporte en chaîne et il est relu en BigInt.
  return {
    blockhash: value.blockhash,
    lastValidBlockHeight: String(value.lastValidBlockHeight)
  };
}

// Diffusion d'une transaction déjà signée.
// Privy sait signer ET diffuser, mais sa diffusion attend la confirmation
// via une souscription WebSocket qui, en pratique, ne se termine jamais ici :
// l'envoi restait bloqué à l'étape "signature et diffusion". On ne lui
// demande donc plus que la signature, et on diffuse par le même RPC que le
// reste de l'application.
export async function sendRawSolanaTransaction(
  base64Transaction: string
): Promise<{ signature: string } | { error: string }> {
  const res = await safeFetch<any>(SOLANA_RPC, {
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'sendTransaction',
      params: [base64Transaction, { encoding: 'base64', preflightCommitment: 'confirmed' }]
    })
  }, null);

  if (!res) return { error: "Réseau Solana injoignable au moment de la diffusion." };
  // Le RPC refuse explicitement une transaction invalide : on remonte son
  // message plutôt qu'un échec générique.
  if (res.error) return { error: res.error.message || 'Transaction refusée par le réseau.' };
  if (typeof res.result !== 'string') return { error: 'Réponse inattendue du réseau Solana.' };

  return { signature: res.result };
}

export async function getSolanaWalletData(address: string): Promise<WalletData> {
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
        { limit: HISTORY_LIMIT }
      ]
    };

    const txRes = await safeFetch<any>(SOLANA_RPC, {
      method: 'POST',
      body: JSON.stringify(txReq)
    }, null);

    const signatures: SignatureEntry[] = Array.isArray(txRes?.result) ? txRes.result : [];

    // 3. Montant réel de chaque transaction
    const deltas = await fetchLamportDeltas(signatures.map((tx) => tx.signature), address);

    const transactions: Transaction[] = signatures.map((tx) => {
      const delta = deltas.get(tx.signature) ?? null;

      let direction: Transaction['direction'] = 'unknown';
      if (delta !== null) {
        direction = delta > 0 ? 'in' : delta < 0 ? 'out' : 'none';
      }

      return {
        hash: tx.signature,
        from: direction === 'in' ? 'Solana Network' : address,
        to: direction === 'out' ? 'Solana Network' : address,
        // Lamports, comme l'ETH est en wei et le BTC en satoshis :
        // la conversion se fait à l'affichage.
        value: delta === null ? null : Math.abs(delta).toString(),
        timeStamp: tx.blockTime ? tx.blockTime.toString() : '0',
        chain: 'solana',
        direction,
        failed: Boolean(tx.err)
      };
    });

    return { balanceSol, transactions };
  } catch (error) {
    console.error("Erreur lors de la récupération des données SOL :", error);
    return { balanceSol: "0.00", transactions: [] };
  }
}
