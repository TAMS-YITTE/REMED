export interface CsvTransaction {
  date: string;
  type: 'buy' | 'sell';
  symbol: string;
  quantity: number;
  fiatAmount: number;
  unitPrice: number;
  provider: string;
  missingAmount?: boolean;
}

export interface CsvParseResult {
  transactions: CsvTransaction[];
  warnings: string[];
}

export function extractBaseSymbol(rawSymbol: string): string {
  if (!rawSymbol) return 'BTC';
  let sym = rawSymbol.trim().toUpperCase();

  // Traitement des séparateurs courants (BTC/EUR, ETH-USDT, SOL_EUR)
  if (sym.includes('/') || sym.includes('-') || sym.includes('_')) {
    const parts = sym.split(/[\/\-_]/);
    if (parts[0]) return parts[0].trim();
  }

  // Traitement des paires de devises collées (ex: BTCEUR, ETHUSDT, SOLEUR, ADAUSDC)
  const quotes = ['USDT', 'USDC', 'BUSD', 'EUR', 'USD'];
  for (const q of quotes) {
    if (sym.endsWith(q) && sym.length > q.length) {
      return sym.slice(0, -q.length);
    }
  }

  return sym;
}

export function parseTransactionCsv(csvText: string): CsvParseResult {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const warnings: string[] = [];
  const transactions: CsvTransaction[] = [];

  if (lines.length < 2) {
    return { transactions: [], warnings: ['Le fichier CSV est vide ou ne contient aucune ligne de données.'] };
  }

  const headers = lines[0].toLowerCase().split(/[,;]/).map(h => h.trim().replace(/^["']|["']$/g, ''));

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
    const symbolRaw = symbolIdx !== -1 ? cols[symbolIdx] : cols[0];
    const qtyRaw = qtyIdx !== -1 ? cols[qtyIdx] : cols[1];
    const amountRaw = amountIdx !== -1 ? cols[amountIdx] : cols[2];

    const quantity = parseFloat(qtyRaw?.replace(',', '.') || '0');
    const fiatAmount = parseFloat(amountRaw?.replace(',', '.') || '0');

    if (isNaN(quantity) || quantity <= 0) {
      warnings.push(`Ligne ${i + 1} ignorée : Quantité crypto invalide (${qtyRaw}).`);
      continue;
    }

    const symbol = extractBaseSymbol(symbolRaw);
    const type: 'buy' | 'sell' = (typeRaw && (typeRaw.includes('sell') || typeRaw.includes('vente'))) ? 'sell' : 'buy';
    const missingAmount = isNaN(fiatAmount) || fiatAmount <= 0;

    if (missingAmount) {
      warnings.push(`Ligne ${i + 1} (${symbol}) : Montant en EUR non renseigné (coût d'acquisition inconnu).`);
    }

    const validFiat = missingAmount ? 0 : fiatAmount;
    const unitPrice = validFiat > 0 && quantity > 0 ? validFiat / quantity : 0;

    transactions.push({
      date: dateRaw || new Date().toISOString(),
      type,
      symbol,
      quantity,
      fiatAmount: validFiat,
      unitPrice,
      provider: 'Import CSV',
      missingAmount
    });
  }

  return { transactions, warnings };
}
