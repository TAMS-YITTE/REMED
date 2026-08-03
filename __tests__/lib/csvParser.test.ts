import { parseTransactionCsv, extractBaseSymbol } from '@/lib/csvParser';

describe('csvParser - Importation fiable et sans faux chiffres', () => {
  it('extrait proprement les symboles de base à partir des paires de devises', () => {
    expect(extractBaseSymbol('BTC/EUR')).toBe('BTC');
    expect(extractBaseSymbol('ETH-USDT')).toBe('ETH');
    expect(extractBaseSymbol('SOLEUR')).toBe('SOL');
    expect(extractBaseSymbol('ADA_USDC')).toBe('ADA');
    expect(extractBaseSymbol('LINK')).toBe('LINK');
  });

  it('ne doit JAMAIS inventer un coût (quantity * 100) si le montant fiat est absent', () => {
    const csvContent = `Date,Type,Actif,Quantité,Montant EUR\n2026-05-01,Buy,BTC,0.1,`;
    const result = parseTransactionCsv(csvContent);

    expect(result.transactions.length).toBe(1);
    const tx = result.transactions[0];
    expect(tx.symbol).toBe('BTC');
    expect(tx.quantity).toBe(0.1);
    expect(tx.fiatAmount).toBe(0);
    expect(tx.missingAmount).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
