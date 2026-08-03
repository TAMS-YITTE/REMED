// Logique pure des alertes de prix et de variation (pas d'I/O) — testable en isolation.

export type AlertDirection = 'above' | 'below';
export type AlertType = 'threshold' | 'change_24h';

export interface PriceAlertRow {
  id: string;
  crypto: string;          // symbole minuscule (btc, eth...)
  direction: AlertDirection;
  target_price: number;    // seuil en EUR (si threshold) ou en % (si change_24h)
  alert_type?: AlertType;
  email: string;
  active: boolean;
}

export function isAlertTriggered(
  alert: Pick<PriceAlertRow, 'direction' | 'target_price' | 'alert_type'>,
  currentValue: number
): boolean {
  if (alert.direction === 'above') return currentValue >= alert.target_price;
  return currentValue <= alert.target_price;
}

export function selectTriggeredAlerts(
  alerts: PriceAlertRow[],
  marketData: Record<string, { price: number; change24h: number }>
): Array<{ alert: PriceAlertRow; value: number }> {
  const out: Array<{ alert: PriceAlertRow; value: number }> = [];
  for (const alert of alerts) {
    if (!alert.active) continue;
    const item = marketData[alert.crypto.toLowerCase()];
    if (!item) continue;

    const is24h = alert.alert_type === 'change_24h';
    const val = is24h ? item.change24h : item.price;

    if (isAlertTriggered(alert, val)) {
      out.push({ alert, value: val });
    }
  }
  return out;
}
