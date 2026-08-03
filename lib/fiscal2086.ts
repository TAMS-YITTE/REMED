// Moteur de calcul de la Plus-Value Réalisée selon le Formulaire 2086 (CGI Art. 150 VH bis)
// DISCLAIMER OBLIGATOIRE : Ce module fournit une aide au calcul indicatif et ne remplace pas un conseil fiscal professionnel.

export interface TradeTransaction {
  id?: string;
  date: string;
  type: 'buy' | 'sell';
  symbol: string;
  quantity: number;
  fiatAmount: number;
  portfolioValueAtSale?: number; // V = valeur globale au moment de la cession (optionnel)
}

export interface CessionEvent {
  id?: string;
  date: string;
  symbol: string;
  cryptoSoldQuantity: number;
  salePriceEur: number;            // P = Prix de cession en EUR
  totalPortfolioValueEur: number;  // V = Valeur globale du portefeuille au moment de la cession
  totalAcquisitionCostsEur: number; // M = Total des prix d'acquisition du portefeuille avant cession
}

export interface CessionCalculationResult {
  id?: string;
  date: string;
  symbol: string;
  cryptoSoldQuantity: number;
  salePriceEur: number;
  totalPortfolioValueEur: number;
  totalAcquisitionCostsEur: number;
  fractionAcquisitionCostEur: number; // M * (P / V)
  realizedCapitalGainEur: number;    // P - (M * P / V)
}

export interface Report2086Result {
  cessions: CessionCalculationResult[];
  totalSaleAmountEur: number;
  totalNetRealizedGainEur: number;
  isExemptUnder305Eur: boolean;
  estimatedFlatTax30Percent: number; // 30% (12.8% IR + 17.2% PS)
  disclaimer: string;
}

export const LEGAL_DISCLAIMER_2086 =
  "Ce rapport 2086 est une simulation indicative calculée selon l'Art. 150 VH bis du CGI et ne remplace en aucun cas un conseil fiscal professionnel.";

export function calculateSingleCession2086(event: CessionEvent): CessionCalculationResult {
  const P = Math.max(0, event.salePriceEur);
  const V = Math.max(0, event.totalPortfolioValueEur > 0 ? event.totalPortfolioValueEur : P);
  const M = Math.max(0, event.totalAcquisitionCostsEur);

  if (P <= 0 || V <= 0) {
    return {
      id: event.id,
      date: event.date,
      symbol: event.symbol,
      cryptoSoldQuantity: event.cryptoSoldQuantity,
      salePriceEur: P,
      totalPortfolioValueEur: V,
      totalAcquisitionCostsEur: M,
      fractionAcquisitionCostEur: 0,
      realizedCapitalGainEur: P,
    };
  }

  const fractionAcquisitionCostEur = M * (P / V);
  const realizedCapitalGainEur = P - fractionAcquisitionCostEur;

  return {
    id: event.id,
    date: event.date,
    symbol: event.symbol,
    cryptoSoldQuantity: event.cryptoSoldQuantity,
    salePriceEur: P,
    totalPortfolioValueEur: V,
    totalAcquisitionCostsEur: M,
    fractionAcquisitionCostEur: Math.round(fractionAcquisitionCostEur * 100) / 100,
    realizedCapitalGainEur: Math.round(realizedCapitalGainEur * 100) / 100,
  };
}

/**
 * Traite une séquence chronologique complète de transactions (Achats + Ventes)
 * et calcule au fil de l'eau la plus-value réalisée (2086) et la mise à jour de M.
 */
export function computeChronological2086(trades: TradeTransaction[]): Report2086Result {
  // Trier par date croissante
  const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let M = 0; // Total des prix d'acquisition payés pour le portefeuille
  const cessions: CessionCalculationResult[] = [];

  for (const trade of sorted) {
    if (trade.type === 'buy') {
      M += Math.max(0, trade.fiatAmount);
    } else if (trade.type === 'sell') {
      const P = Math.max(0, trade.fiatAmount);
      const V = trade.portfolioValueAtSale && trade.portfolioValueAtSale > 0 ? trade.portfolioValueAtSale : Math.max(P, M);

      const event: CessionEvent = {
        id: trade.id,
        date: trade.date,
        symbol: trade.symbol,
        cryptoSoldQuantity: trade.quantity,
        salePriceEur: P,
        totalPortfolioValueEur: V,
        totalAcquisitionCostsEur: M,
      };

      const result = calculateSingleCession2086(event);
      cessions.push(result);

      // Mise à jour de M pour les cessions futures : M_nouveau = M_ancien - F
      M = Math.max(0, M - result.fractionAcquisitionCostEur);
    }
  }

  const totalSaleAmountEur = cessions.reduce((acc, c) => acc + c.salePriceEur, 0);
  const totalNetRealizedGainEur = cessions.reduce((acc, c) => acc + c.realizedCapitalGainEur, 0);
  const isExemptUnder305Eur = totalSaleAmountEur <= 305;
  const taxableGain = isExemptUnder305Eur ? 0 : Math.max(0, totalNetRealizedGainEur);
  const estimatedFlatTax30Percent = Math.round(taxableGain * 0.30 * 100) / 100;

  return {
    cessions,
    totalSaleAmountEur: Math.round(totalSaleAmountEur * 100) / 100,
    totalNetRealizedGainEur: Math.round(totalNetRealizedGainEur * 100) / 100,
    isExemptUnder305Eur,
    estimatedFlatTax30Percent,
    disclaimer: LEGAL_DISCLAIMER_2086,
  };
}
