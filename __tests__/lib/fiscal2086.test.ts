import { calculateSingleCession2086, computeChronological2086, LEGAL_DISCLAIMER_2086 } from '@/lib/fiscal2086';

describe('fiscal2086 - Moteur de calcul de plus-value réalisée (Formulaire 2086)', () => {
  it('calcule la plus-value de cession selon la formule P - (M * P / V)', () => {
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

  it('traite une séquence chronologique d\'achats et de ventes avec déduction progressive du coût d\'acquisition (M)', () => {
    const report = computeChronological2086([
      { date: '2026-01-01', type: 'buy', symbol: 'BTC', quantity: 0.1, fiatAmount: 1000 },
      { date: '2026-02-01', type: 'sell', symbol: 'BTC', quantity: 0.05, fiatAmount: 800, portfolioValueAtSale: 1600 },
      { date: '2026-03-01', type: 'sell', symbol: 'BTC', quantity: 0.05, fiatAmount: 900, portfolioValueAtSale: 900 },
    ]);

    expect(report.cessions.length).toBe(2);

    // Cession 1: P=800, V=1600, M_initial=1000 -> F1 = 1000 * (800/1600) = 500. PV1 = 800 - 500 = 300.
    const c1 = report.cessions[0];
    expect(c1.fractionAcquisitionCostEur).toBe(500);
    expect(c1.realizedCapitalGainEur).toBe(300);

    // M_restant = 1000 - 500 = 500.
    // Cession 2: P=900, V=900, M=500 -> F2 = 500 * (900/900) = 500. PV2 = 900 - 500 = 400.
    const c2 = report.cessions[1];
    expect(c2.fractionAcquisitionCostEur).toBe(500);
    expect(c2.realizedCapitalGainEur).toBe(400);

    expect(report.totalSaleAmountEur).toBe(1700);
    expect(report.totalNetRealizedGainEur).toBe(700);
    expect(report.estimatedFlatTax30Percent).toBe(210); // 30% de 700€
    expect(report.disclaimer).toBe(LEGAL_DISCLAIMER_2086);
  });
});
