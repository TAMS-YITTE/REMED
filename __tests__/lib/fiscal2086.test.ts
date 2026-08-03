import { calculateSingleCession2086, computeReport2086 } from '@/lib/fiscal2086';

describe('fiscal2086 - Moteur de calcul de plus-value réalisée (Formulaire 2086)', () => {
  it('calcule la plus-value de cession selon la formule P - (M * P / V)', () => {
    // Exemple : Portefeuille acheté 1000€ (M), valeur actuelle 2000€ (V).
    // Cession de 500€ (P).
    // Fraction de prix de revient = 1000 * (500 / 2000) = 250€.
    // Plus-value = 500 - 250 = 250€.
    const result = calculateSingleCession2086({
      date: '2026-06-15',
      symbol: 'BTC',
      cryptoSoldQuantity: 0.01,
      salePriceEur: 500,
      totalPortfolioValueEur: 2000,
      totalAcquisitionCostsEur: 1000,
    });

    expect(result.fractionAcquisitionCostEur).toBe(250);
    expect(result.realizedCapitalGainEur).toBe(250);
  });

  it('applique l\'exonération fiscale si le total annuel des cessions est inférieur ou égal à 305 €', () => {
    const report = computeReport2086([
      {
        date: '2026-03-10',
        symbol: 'ETH',
        cryptoSoldQuantity: 0.05,
        salePriceEur: 200,
        totalPortfolioValueEur: 1000,
        totalAcquisitionCostsEur: 500,
      },
    ]);

    expect(report.totalSaleAmountEur).toBe(200);
    expect(report.isExemptUnder305Eur).toBe(true);
    expect(report.estimatedFlatTax30Percent).toBe(0);
  });

  it('calcule la flat tax de 30% lorsque les cessions dépassent 305 €', () => {
    const report = computeReport2086([
      {
        date: '2026-04-12',
        symbol: 'BTC',
        cryptoSoldQuantity: 0.02,
        salePriceEur: 1000,
        totalPortfolioValueEur: 2000,
        totalAcquisitionCostsEur: 1000,
      },
    ]);

    expect(report.totalSaleAmountEur).toBe(1000);
    expect(report.isExemptUnder305Eur).toBe(false);
    expect(report.totalNetRealizedGainEur).toBe(500);
    expect(report.estimatedFlatTax30Percent).toBe(150); // 30% de 500€
  });
});
