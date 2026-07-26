// Logique pure des alertes de prix (pas d'I/O) — testable en isolation.

export type AlertDirection = 'above' | 'below';

export interface PriceAlertRow {
  id: string;
  crypto: string;          // symbole minuscule (btc, eth...)
  direction: AlertDirection;
  target_price: number;    // seuil en EUR
  email: string;
  active: boolean;
}

// Une alerte se déclenche quand le prix courant franchit le seuil dans le
// sens choisi : 'above' → prix >= seuil, 'below' → prix <= seuil.
export function isAlertTriggered(
  alert: Pick<PriceAlertRow, 'direction' | 'target_price'>,
  currentPrice: number
): boolean {
  if (alert.direction === 'above') return currentPrice >= alert.target_price;
  return currentPrice <= alert.target_price;
}

// Filtre les alertes actives dont le seuil est franchi, en associant le prix
// courant. Ignore une alerte si le prix de sa crypto est indisponible.
export function selectTriggeredAlerts(
  alerts: PriceAlertRow[],
  prices: Record<string, number>
): Array<{ alert: PriceAlertRow; price: number }> {
  const out: Array<{ alert: PriceAlertRow; price: number }> = [];
  for (const alert of alerts) {
    if (!alert.active) continue;
    const price = prices[alert.crypto.toLowerCase()];
    if (price == null) continue;
    if (isAlertTriggered(alert, price)) {
      out.push({ alert, price });
    }
  }
  return out;
}
