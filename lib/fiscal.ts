// Logique de calcul du relevé fiscal, PURE et sans I/O (pas de DB, pas de
// réseau) pour être testable en isolation. L'action serveur
// app/actions/fiscal.ts se charge de lire Supabase puis délègue ici.

export interface PurchaseRow {
  provider: string | null;
  fiat_amount: number | string;
  crypto_amount: number | string;
  crypto_currency: string | null;
  created_at: string;
}

export interface AcquisitionLot {
  date: string;
  provider: string;
  fiatAmount: number;
  cryptoAmount: number;
  unitPrice: number; // prix d'acquisition unitaire en EUR
}

export interface AssetSummary {
  symbol: string;
  totalInvested: number;   // EUR investi (prix de revient total)
  totalQuantity: number;   // quantité acquise via Remedly ou CSV
  avgUnitCost: number | null; // prix de revient moyen unitaire (null si prix inconnu)
  currentPrice: number | null;
  currentValue: number | null;
  latentPL: number | null;      // plus-value latente (null si prix inconnu)
  latentPLPercent: number | null;
  lots: AcquisitionLot[];
  externalFundsWarning: 'deposit' | 'outflow' | null;
  costInconnu?: boolean;   // vrai si aucun prix d'acquisition n'est enregistré
}

export interface FiscalReport {
  generatedAt: string;
  hasData: boolean;
  pricesAvailable: boolean;
  assets: AssetSummary[];
  totalInvested: number;
  totalCurrentValue: number | null;
  totalLatentPL: number | null;
  hasUnknownCosts?: boolean;
}

export const EMPTY_REPORT: FiscalReport = {
  generatedAt: new Date(0).toISOString(),
  hasData: false,
  pricesAvailable: false,
  assets: [],
  totalInvested: 0,
  totalCurrentValue: null,
  totalLatentPL: null,
  hasUnknownCosts: false,
};

// Tolérance sur la comparaison de quantités on-chain (arrondis, poussière).
const QTY_TOLERANCE = 0.01; // 1 %

// Construit le relevé à partir des ACQUISITIONS uniquement.
export function computeFiscalReport(
  purchases: PurchaseRow[],
  prices: Record<string, number> | null,
  onChainQuantities?: Record<string, number>
): FiscalReport {
  const valid = purchases.filter(
    (t) => Number(t.crypto_amount) > 0 && Number(t.fiat_amount) > 0
  );

  const hasOnChainData = onChainQuantities && Object.values(onChainQuantities).some(val => val > 0);

  if (valid.length === 0 && !hasOnChainData) {
    return { ...EMPTY_REPORT, generatedAt: new Date().toISOString() };
  }

  const bySymbol = new Map<string, AssetSummary>();

  for (const t of valid) {
    const symbol = (t.crypto_currency || '').toLowerCase();
    if (!symbol) continue;

    const fiatAmount = Number(t.fiat_amount);
    const cryptoAmount = Number(t.crypto_amount);

    let entry = bySymbol.get(symbol);
    if (!entry) {
      entry = {
        symbol,
        totalInvested: 0,
        totalQuantity: 0,
        avgUnitCost: null,
        currentPrice: null,
        currentValue: null,
        latentPL: null,
        latentPLPercent: null,
        lots: [],
        externalFundsWarning: null,
        costInconnu: false,
      };
      bySymbol.set(symbol, entry);
    }

    entry.totalInvested += fiatAmount;
    entry.totalQuantity += cryptoAmount;
    entry.lots.push({
      date: t.created_at,
      provider: t.provider || 'inconnu',
      fiatAmount,
      cryptoAmount,
      unitPrice: cryptoAmount > 0 ? fiatAmount / cryptoAmount : 0,
    });
  }

  if (onChainQuantities) {
    for (const [sym, qtyVal] of Object.entries(onChainQuantities)) {
      const symbol = sym.toLowerCase();
      if (qtyVal > 0 && !bySymbol.has(symbol)) {
        bySymbol.set(symbol, {
          symbol,
          totalInvested: 0,
          totalQuantity: qtyVal,
          avgUnitCost: null,
          currentPrice: null,
          currentValue: null,
          latentPL: null,
          latentPLPercent: null,
          lots: [],
          externalFundsWarning: 'deposit',
          costInconnu: true,
        });
      }
    }
  }

  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalLatentPLSum = 0;
  let hasKnownInvestments = false;
  let anyCurrentValue = false;
  let hasUnknownCosts = false;

  for (const asset of bySymbol.values()) {
    const hasInvested = asset.totalInvested > 0;

    if (hasInvested) {
      asset.avgUnitCost = asset.totalQuantity > 0 ? asset.totalInvested / asset.totalQuantity : 0;
      asset.costInconnu = false;
      totalInvested += asset.totalInvested;
      hasKnownInvestments = true;
    } else {
      asset.avgUnitCost = null;
      asset.costInconnu = true;
      hasUnknownCosts = true;
    }

    const price = prices ? prices[asset.symbol] ?? null : null;
    if (price != null) {
      asset.currentPrice = price;
      asset.currentValue = asset.totalQuantity * price;

      if (hasInvested) {
        asset.latentPL = asset.currentValue - asset.totalInvested;
        asset.latentPLPercent = asset.latentPL / asset.totalInvested;
        totalLatentPLSum += asset.latentPL;
      } else {
        asset.latentPL = null;
        asset.latentPLPercent = null;
      }

      totalCurrentValue += asset.currentValue;
      anyCurrentValue = true;
    }

    if (onChainQuantities && onChainQuantities[asset.symbol] != null) {
      const onChain = onChainQuantities[asset.symbol];
      const acquired = asset.totalQuantity;
      if (acquired > 0 && onChain > acquired * (1 + QTY_TOLERANCE)) {
        asset.externalFundsWarning = 'deposit';
      } else if (acquired > 0 && onChain < acquired * (1 - QTY_TOLERANCE)) {
        asset.externalFundsWarning = 'outflow';
      }
    }
  }

  const assets = Array.from(bySymbol.values()).sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));

  return {
    generatedAt: new Date().toISOString(),
    hasData: true,
    pricesAvailable: !!prices,
    assets,
    totalInvested,
    totalCurrentValue: anyCurrentValue ? totalCurrentValue : null,
    totalLatentPL: hasKnownInvestments && anyCurrentValue ? totalLatentPLSum : null,
    hasUnknownCosts,
  };
}
