// Construction d'un virement Bitcoin (taproot, key-path).
//
// Privy ne diffuse pas les transactions Bitcoin : il ne sait que signer un
// hash brut (`useSignRawHash`), en appliquant lui-même le tweak BIP-341.
// Tout le reste — choix des entrées, frais, monnaie rendue, assemblage,
// diffusion — est à notre charge. C'est la partie où une erreur coûte des
// fonds définitivement, d'où les vérifications explicites ci-dessous.
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';
import { planTransfer } from './bitcoinPlan';
import type { Utxo } from './bitcoinPlan';

export { btcToSats, planTransfer, DUST_LIMIT, estimateVBytes } from './bitcoinPlan';
export type { Utxo } from './bitcoinPlan';

export interface PlannedTransfer {
  inputs: Utxo[];
  amountSats: bigint;
  feeSats: bigint;
  changeSats: bigint;
  /** Hash de chaque entrée à faire signer, dans l'ordre des entrées. */
  sighashes: string[];
  /** Transaction prête à recevoir les signatures. */
  tx: btc.Transaction;
}

export function buildTransfer({
  utxos,
  fromAddress,
  toAddress,
  amountSats,
  feeRate,
}: {
  utxos: Utxo[];
  fromAddress: string;
  toAddress: string;
  amountSats: bigint;
  feeRate: number;
}): PlannedTransfer {
  const { inputs, feeSats, changeSats } = planTransfer({ utxos, amountSats, feeRate });

  // Le script de l'adresse suffit pour signer un key-path : il est déduit de
  // l'adresse elle-même, sans avoir besoin de la clé publique.
  const script = btc.OutScript.encode(btc.Address().decode(fromAddress));

  const tx = new btc.Transaction();
  for (const utxo of inputs) {
    tx.addInput({
      txid: hex.decode(utxo.txid),
      index: utxo.vout,
      witnessUtxo: { script, amount: BigInt(utxo.value) },
      sighashType: btc.SigHash.DEFAULT,
    });
  }

  tx.addOutputAddress(toAddress, amountSats);
  if (changeSats > BigInt(0)) {
    tx.addOutputAddress(fromAddress, changeSats);
  }

  // Contrôle final : la somme des entrées doit égaler sorties + frais.
  const totalIn = inputs.reduce((sum, u) => sum + BigInt(u.value), BigInt(0));
  if (totalIn !== amountSats + changeSats + feeSats) {
    throw new Error('Incohérence dans le calcul de la transaction : envoi annulé.');
  }

  // Le sighash taproot engage TOUTES les entrées, pas seulement celle qu'on
  // signe : les tableaux de scripts et de montants doivent donc couvrir
  // l'ensemble des entrées. Ne passer que l'entrée courante fonctionnait
  // tant qu'il n'y en avait qu'une, et échouait dès la deuxième
  // ("Invalid amounts array").
  const allScripts = inputs.map(() => script);
  const allAmounts = inputs.map((u) => BigInt(u.value));

  const sighashes = inputs.map((_, i) =>
    hex.encode(tx.preimageWitnessV1(i, allScripts, btc.SigHash.DEFAULT, allAmounts))
  );

  return { inputs, amountSats, feeSats, changeSats, sighashes, tx };
}

// Assemble la transaction finale à partir des signatures obtenues de Privy.
// `signatures` doit être dans le même ordre que `plan.inputs`.
export function finalizeTransfer(plan: PlannedTransfer, signatures: string[]): string {
  if (signatures.length !== plan.inputs.length) {
    throw new Error('Nombre de signatures incohérent : envoi annulé.');
  }

  signatures.forEach((signature, i) => {
    const bytes = hex.decode(signature.replace(/^0x/, ''));
    // Une signature Schnorr fait 64 octets (65 avec un type de hachage
    // explicite). Toute autre taille signifie qu'on n'a pas ce qu'on croit.
    if (bytes.length !== 64 && bytes.length !== 65) {
      throw new Error(`Signature inattendue pour l'entrée ${i} (${bytes.length} octets) : envoi annulé.`);
    }
    plan.tx.updateInput(i, { tapKeySig: bytes });
  });

  plan.tx.finalize();
  return hex.encode(plan.tx.extract());
}

// Vérifie qu'une adresse Bitcoin est lisible AVANT tout envoi : une adresse
// invalide ou d'un autre réseau signifie des fonds perdus.
export function isValidBitcoinAddress(value: string): boolean {
  try {
    btc.Address().decode(value.trim());
    return true;
  } catch {
    return false;
  }
}
