// Moteur de calcul de la Plus-Value Réalisée selon le Formulaire 2086 (CGI Art. 150 VH bis)
// Avertissement : Ce module fournit une aide au calcul indicatif et ne remplace pas un conseil fiscal officiel.

export interface CessionEvent {
  date: string;
  symbol: string;
  cryptoSoldQuantity: number;
  salePriceEur: number;            // P = Prix de cession en EUR
  totalPortfolioValueEur: number;  // V = Valeur globale du portefeuille au moment de la cession
  totalAcquisitionCostsEur: number; // M = Total des prix d'acquisition du portefeuille
}

export interface CessionCalculationResult {
  date: string;
  symbol: string;
  cryptoSoldQuantity: number;
  salePriceEur: number;
  fractionAcquisitionCostEur: number; // M * (P / V)
  realizedCapitalGainEur: number;    // P - (M * P / V)
}

export interface Report2086Result {
  cessions: CessionCalculationResult[];
  totalSaleAmountEur: number;
  totalNetRealizedGainEur: number;
  isExemptUnder305Eur: boolean;
  estimatedFlatTax30Percent: number; // 30% (12.8% IR + 17.2% PS)
}

/**
 * Calcule la plus-value réalisée pour une cession selon la formule 2086 :
 * PV = P - (M * P / V)
 */
export function calculateSingleCession2086(event: CessionEvent): CessionCalculationResult {
  const P = Math.max(0, event.salePriceEur);
  const V = Math.max(0, event.totalPortfolioValueEur);
  const M = Math.max(0, event.totalAcquisitionCostsEur);

  if (P <= 0 || V <= 0) {
    return {
      date: event.date,
      symbol: event.symbol,
      cryptoSoldQuantity: event.cryptoSoldQuantity,
      salePriceEur: P,
      fractionAcquisitionCostEur: 0,
      realizedCapitalGainEur: P,
    };
  }

  // Fraction du capital investi déduite : M * (P / V)
  const fractionAcquisitionCostEur = M * (P / V);
  const realizedCapitalGainEur = P - fractionAcquisitionCostEur;

  return {
    date: event.date,
    symbol: event.symbol,
    cryptoSoldQuantity: event.cryptoSoldQuantity,
    salePriceEur: P,
    fractionAcquisitionCostEur: Math.round(fractionAcquisitionCostEur * 100) / 100,
    realizedCapitalGainEur: Math.round(realizedCapitalGainEur * 100) / 100,
  };
}

/**
 * Calcule le bilan fiscal global 2086 pour l'année.
 */
export function computeReport2086(events: CessionEvent[]): Report2086Result {
  const cessions = events.map(calculateSingleCession2086);

  const totalSaleAmountEur = cessions.reduce((acc, c) => acc + c.salePriceEur, 0);
  const totalNetRealizedGainEur = cessions.reduce((acc, c) => acc + c.realizedCapitalGainEur, 0);

  // Exonération si le total annuel des cessions < 305 € (Art. 150 VH bis II-A)
  const isExemptUnder305Eur = totalSaleAmountEur <= 305;

  const taxableGain = isExemptUnder305Eur ? 0 : Math.max(0, totalNetRealizedGainEur);
  const estimatedFlatTax30Percent = Math.round(taxableGain * 0.30 * 100) / 100;

  return {
    cessions,
    totalSaleAmountEur: Math.round(totalSaleAmountEur * 100) / 100,
    totalNetRealizedGainEur: Math.round(totalNetRealizedGainEur * 100) / 100,
    isExemptUnder305Eur,
    estimatedFlatTax30Percent,
  };
}
