// Arithmétique d'un virement Bitcoin : choix des entrées, frais, monnaie.
//
// Volontairement SANS dépendance : c'est la partie où une erreur envoie le
// solde aux mineurs, elle doit rester lisible et testable seule.

export interface Utxo {
  txid: string;
  vout: number;
  value: number; // satoshis
}

// Une sortie en dessous de ce seuil est refusée par le réseau ("poussière") :
// on la reverse aux frais plutôt que de produire une transaction invalide.
export const DUST_LIMIT = BigInt(546);

export function btcToSats(value: string): bigint {
  const cleaned = (value || '0').trim().replace(',', '.');
  const [intPart = '0', fracPart = ''] = cleaned.split('.');
  const fracPadded = (fracPart + '00000000').slice(0, 8);
  return BigInt(intPart || '0') * BigInt(100000000) + BigInt(fracPadded || '0');
}

// Taille estimée : chaque entrée taproot key-path pèse ~58 voctets, chaque
// sortie ~43, plus ~11 d'en-tête. Volontairement majorée : sous-estimer les
// frais fait rejeter la transaction par les noeuds.
export function estimateVBytes(inputCount: number, outputCount: number): number {
  return 11 + inputCount * 58 + outputCount * 43;
}

/**
 * Sélectionne les entrées et calcule frais et monnaie.
 * Lève une erreur explicite plutôt que de produire une transaction bancale.
 */
export function planTransfer({
  utxos,
  amountSats,
  feeRate,
}: {
  utxos: Utxo[];
  amountSats: bigint;
  feeRate: number;
}): { inputs: Utxo[]; feeSats: bigint; changeSats: bigint } {
  if (amountSats < DUST_LIMIT) {
    throw new Error(`Montant trop faible : le réseau Bitcoin refuse en dessous de ${DUST_LIMIT} satoshis.`);
  }

  // Les plus grosses entrées d'abord : moins d'entrées, donc moins de frais.
  const sorted = [...utxos].sort((a, b) => b.value - a.value);
  const inputs: Utxo[] = [];
  let total = BigInt(0);

  for (const utxo of sorted) {
    inputs.push(utxo);
    total += BigInt(utxo.value);

    // Frais recalculés à chaque ajout : une entrée de plus coûte plus cher.
    const withChange = BigInt(Math.ceil(estimateVBytes(inputs.length, 2) * feeRate));
    const withoutChange = BigInt(Math.ceil(estimateVBytes(inputs.length, 1) * feeRate));

    const change = total - amountSats - withChange;
    if (change >= DUST_LIMIT) {
      return { inputs, feeSats: withChange, changeSats: change };
    }
    // Monnaie trop petite pour exister : elle passe en frais, sans sortie
    // de monnaie.
    if (total >= amountSats + withoutChange) {
      return { inputs, feeSats: total - amountSats, changeSats: BigInt(0) };
    }
  }

  throw new Error('Solde insuffisant pour couvrir le montant et les frais de réseau.');
}
