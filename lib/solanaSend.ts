// Construction d'un virement SOL natif, sérialisé au format attendu par
// Privy (`signAndSendTransaction` prend un Uint8Array, pas un objet).
//
// Privy signe et diffuse ; c'est à nous de composer la transaction et de
// fournir un blockhash récent — un blockhash périmé fait rejeter la
// transaction par le réseau (elle n'est jamais diffusée, aucun fonds ne
// bouge).
import {
  address,
  appendTransactionMessageInstruction,
  createTransactionMessage,
  compileTransaction,
  getBase64EncodedWireTransaction,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
} from '@solana/kit';
import { getTransferSolInstruction } from '@solana-program/system';

// Le projet cible ES2017 : pas de littéraux BigInt (123n), on passe par BigInt().
export const LAMPORTS_PER_SOL = BigInt(1000000000);

// Convertit un montant en SOL (saisi par l'utilisateur) en lamports, sans
// passer par un flottant : 0.1 SOL en Number donne 99999999.99999999
// lamports une fois multiplié, ce qui casse la transaction.
export function solToLamports(value: string): bigint {
  const cleaned = (value || '0').trim().replace(',', '.');
  const [intPart = '0', fracPart = ''] = cleaned.split('.');
  const fracPadded = (fracPart + '000000000').slice(0, 9);
  return BigInt(intPart || '0') * LAMPORTS_PER_SOL + BigInt(fracPadded || '0');
}

// Une adresse Solana est une clé publique ed25519 encodée en base58
// (32 octets → 32 à 44 caractères, sans 0, O, I ni l).
export function isValidSolanaAddress(value: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value.trim());
}

export function buildSolTransfer({
  from,
  to,
  lamports,
  blockhash,
  lastValidBlockHeight,
}: {
  from: string;
  to: string;
  lamports: bigint;
  blockhash: string;
  lastValidBlockHeight: bigint;
}): Uint8Array {
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(address(from), m),
    (m) =>
      setTransactionMessageLifetimeUsingBlockhash(
        { blockhash: blockhash as Parameters<typeof setTransactionMessageLifetimeUsingBlockhash>[0]['blockhash'], lastValidBlockHeight },
        m
      ),
    (m) =>
      appendTransactionMessageInstruction(
        getTransferSolInstruction({
          source: { address: address(from) } as never,
          destination: address(to),
          amount: lamports,
        }),
        m
      )
  );

  const compiled = compileTransaction(message);
  const base64 = getBase64EncodedWireTransaction(compiled);
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
