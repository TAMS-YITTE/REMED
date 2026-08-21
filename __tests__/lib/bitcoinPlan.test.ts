import { planTransfer, btcToSats, DUST_LIMIT } from '@/lib/bitcoinPlan';

const utxo = (value: number, i = 0) => ({ txid: 'a'.repeat(64), vout: i, value });

describe('btcToSats - conversion sans flottant', () => {
  it('convertit sans perte (0.1 BTC = 10 000 000 sats)', () => {
    expect(btcToSats('0.1')).toBe(BigInt(10000000));
    expect(btcToSats('0.00438')).toBe(BigInt(438000));
  });

  it('tronque au-delà de 8 décimales au lieu d\'arrondir vers le haut', () => {
    expect(btcToSats('0.123456789')).toBe(BigInt(12345678));
  });
});

describe('planTransfer - la monnaie ne doit jamais partir aux mineurs', () => {
  it('conserve l\'égalité entrées = montant + monnaie + frais', () => {
    const { inputs, feeSats, changeSats } = planTransfer({
      utxos: [utxo(394000), utxo(44000, 1)],
      amountSats: BigInt(50000),
      feeRate: 1,
    });
    const total = inputs.reduce((s, u) => s + BigInt(u.value), BigInt(0));
    expect(total).toBe(BigInt(50000) + changeSats + feeSats);
  });

  it('choisit la plus grosse entrée d\'abord pour limiter les frais', () => {
    const { inputs } = planTransfer({
      utxos: [utxo(44000), utxo(394000, 1)],
      amountSats: BigInt(50000),
      feeRate: 1,
    });
    expect(inputs).toHaveLength(1);
    expect(inputs[0].value).toBe(394000);
  });

  it('ne crée jamais une monnaie en dessous du seuil de poussière', () => {
    // Montant choisi pour que la monnaie tomberait juste sous le seuil.
    const { changeSats, feeSats } = planTransfer({
      utxos: [utxo(60000)],
      amountSats: BigInt(59300),
      feeRate: 1,
    });
    expect(changeSats === BigInt(0) || changeSats >= DUST_LIMIT).toBe(true);
    expect(BigInt(60000)).toBe(BigInt(59300) + changeSats + feeSats);
  });

  it('refuse un montant en dessous du seuil de poussière', () => {
    expect(() =>
      planTransfer({ utxos: [utxo(100000)], amountSats: BigInt(100), feeRate: 1 })
    ).toThrow(/poussière|satoshis/i);
  });

  it('refuse un envoi que le solde ne couvre pas, frais compris', () => {
    expect(() =>
      planTransfer({ utxos: [utxo(50000)], amountSats: BigInt(49999), feeRate: 50 })
    ).toThrow(/insuffisant/i);
  });

  it('augmente les frais avec le débit demandé', () => {
    const lent = planTransfer({ utxos: [utxo(394000)], amountSats: BigInt(50000), feeRate: 1 });
    const rapide = planTransfer({ utxos: [utxo(394000)], amountSats: BigInt(50000), feeRate: 20 });
    expect(rapide.feeSats).toBeGreaterThan(lent.feeSats);
  });
});
