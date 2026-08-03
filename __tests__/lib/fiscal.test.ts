import { computeFiscalReport } from '@/lib/fiscal';

describe('computeFiscalReport - Exactitude des calculs P&L', () => {
  it('ne doit JAMAIS afficher de plus-value latente fictive (100%) pour les actifs déposés sans historique d\'achat', () => {
    const report = computeFiscalReport(
      [], // Aucun achat enregistrer
      { eth: 3000 },
      { eth: 0.5 } // 0.5 ETH déposé de l'extérieur (~1500€)
    );

    expect(report.hasData).toBe(true);
    expect(report.assets.length).toBe(1);

    const ethAsset = report.assets[0];
    expect(ethAsset.symbol).toBe('eth');
    expect(ethAsset.totalQuantity).toBe(0.5);
    expect(ethAsset.currentValue).toBe(1500);
    expect(ethAsset.totalInvested).toBe(0);

    // FIX EXACTITUDE : avgUnitCost, latentPL et latentPLPercent doivent être null
    expect(ethAsset.avgUnitCost).toBeNull();
    expect(ethAsset.latentPL).toBeNull();
    expect(ethAsset.latentPLPercent).toBeNull();
    expect(ethAsset.costInconnu).toBe(true);

    // Ne doit pas gonfler totalLatentPL global
    expect(report.totalLatentPL).toBeNull();
  });

  it('calcule correctement la plus-value latente lorsque l\'historique d\'achat est connu', () => {
    const report = computeFiscalReport(
      [
        {
          provider: 'MoonPay',
          fiat_amount: 100,
          crypto_amount: 0.05,
          crypto_currency: 'eth',
          created_at: new Date().toISOString(),
        },
      ],
      { eth: 3000 },
      { eth: 0.05 }
    );

    const ethAsset = report.assets[0];
    expect(ethAsset.totalInvested).toBe(100);
    expect(ethAsset.totalQuantity).toBe(0.05);
    expect(ethAsset.currentValue).toBe(150);
    expect(ethAsset.avgUnitCost).toBe(2000);
    expect(ethAsset.latentPL).toBe(50);
    expect(ethAsset.latentPLPercent).toBe(0.5); // +50%
    expect(ethAsset.costInconnu).toBe(false);
    expect(report.totalLatentPL).toBe(50);
  });
});
