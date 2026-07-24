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
  totalQuantity: number;   // quantité acquise via Remedly
  avgUnitCost: number;     // prix de revient moyen unitaire
  currentPrice: number | null;
  currentValue: number | null;
  latentPL: number | null;      // plus-value latente (non réalisée)
  latentPLPercent: number | null;
  lots: AcquisitionLot[];
  externalFundsWarning: 'deposit' | 'outflow' | null;
}

export interface FiscalReport {
  generatedAt: string;
  hasData: boolean;
  pricesAvailable: boolean;
  assets: AssetSummary[];
  totalInvested: number;
  totalCurrentValue: number | null;
  totalLatentPL: number | null;
}

export const EMPTY_REPORT: FiscalReport = {
  generatedAt: new Date(0).toISOString(),
  hasData: false,
  pricesAvailable: false,
  assets: [],
  totalInvested: 0,
  totalCurrentValue: null,
  totalLatentPL: null,
};

// Tolérance sur la comparaison de quantités on-chain (arrondis, poussière).
const QTY_TOLERANCE = 0.01; // 1 %

// Construit le relevé à partir des ACQUISITIONS uniquement. Ne calcule aucune
// plus-value réalisée (2086) : Remedly ne réalise pas de vente, il n'existe
// donc aucune cession dans les données.
export function computeFiscalReport(
  purchases: PurchaseRow[],
  prices: Record<string, number> | null,
  onChainQuantities?: Record<string, number>
): FiscalReport {
  const valid = purchases.filter(
    (t) => Number(t.crypto_amount) > 0 && Number(t.fiat_amount) > 0
  );

  if (valid.length === 0) {
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
        avgUnitCost: 0,
        currentPrice: null,
        currentValue: null,
        latentPL: null,
        latentPLPercent: null,
        lots: [],
        externalFundsWarning: null,
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

  let totalInvested = 0;
  let totalCurrentValue = 0;
  let anyCurrentValue = false;

  for (const asset of bySymbol.values()) {
    asset.avgUnitCost = asset.totalQuantity > 0 ? asset.totalInvested / asset.totalQuantity : 0;
    totalInvested += asset.totalInvested;

    const price = prices ? prices[asset.symbol] ?? null : null;
    if (price != null) {
      asset.currentPrice = price;
      asset.currentValue = asset.totalQuantity * price;
      asset.latentPL = asset.currentValue - asset.totalInvested;
      asset.latentPLPercent = asset.totalInvested > 0 ? asset.latentPL / asset.totalInvested : null;
      totalCurrentValue += asset.currentValue;
      anyCurrentValue = true;
    }

    if (onChainQuantities && onChainQuantities[asset.symbol] != null) {
      const onChain = onChainQuantities[asset.symbol];
      const acquired = asset.totalQuantity;
      if (onChain > acquired * (1 + QTY_TOLERANCE)) {
        asset.externalFundsWarning = 'deposit';
      } else if (onChain < acquired * (1 - QTY_TOLERANCE)) {
        asset.externalFundsWarning = 'outflow';
      }
    }
  }

  const assets = Array.from(bySymbol.values()).sort((a, b) => b.totalInvested - a.totalInvested);

  return {
    generatedAt: new Date().toISOString(),
    hasData: true,
    pricesAvailable: !!prices,
    assets,
    totalInvested,
    totalCurrentValue: anyCurrentValue ? totalCurrentValue : null,
    totalLatentPL: anyCurrentValue ? totalCurrentValue - totalInvested : null,
  };
}
