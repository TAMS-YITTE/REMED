export interface CsvTransaction {
  date: string;
  type: 'buy' | 'sell';
  symbol: string;
  quantity: number;
  fiatAmount: number;
  unitPrice: number;
  provider: string;
}

export function parseTransactionCsv(csvText: string): CsvTransaction[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(/[,;]/).map(h => h.trim().replace(/^["']|["']$/g, ''));
  const transactions: CsvTransaction[] = [];

  const findIndex = (keywords: string[]) => {
    return headers.findIndex(h => keywords.some(k => h.includes(k)));
  };

  const dateIdx = findIndex(['date', 'time', 'horodatage', 'timestamp']);
  const typeIdx = findIndex(['type', 'side', 'action', 'sens']);
  const symbolIdx = findIndex(['actif', 'symbol', 'coin', 'crypto', 'asset', 'pair', 'devise']);
  const qtyIdx = findIndex(['quantité', 'quantity', 'amount', 'montant crypto', 'qty', 'exec_qty']);
  const amountIdx = findIndex(['fiat', 'eur', 'total', 'valeur', 'montant eur', 'price']);

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(/[,;]/).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 2) continue;

    const dateRaw = dateIdx !== -1 ? cols[dateIdx] : new Date().toISOString();
    const typeRaw = typeIdx !== -1 ? cols[typeIdx]?.toLowerCase() : 'buy';
    const symbolRaw = symbolIdx !== -1 ? cols[symbolIdx]?.toUpperCase() : 'BTC';
    const qtyRaw = qtyIdx !== -1 ? cols[qtyIdx] : cols[1];
    const amountRaw = amountIdx !== -1 ? cols[amountIdx] : cols[2];

    const quantity = parseFloat(qtyRaw?.replace(',', '.') || '0');
    const fiatAmount = parseFloat(amountRaw?.replace(',', '.') || '0');

    if (isNaN(quantity) || quantity <= 0) continue;

    const type: 'buy' | 'sell' = (typeRaw.includes('sell') || typeRaw.includes('vente')) ? 'sell' : 'buy';
    const unitPrice = fiatAmount > 0 && quantity > 0 ? fiatAmount / quantity : 0;

    transactions.push({
      date: dateRaw || new Date().toISOString(),
      type,
      symbol: symbolRaw.replace(/EUR|USD|USDT/g, ''),
      quantity,
      fiatAmount: fiatAmount || quantity * 100,
      unitPrice,
      provider: 'Import CSV'
    });
  }

  return transactions;
}
