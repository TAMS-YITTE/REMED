export interface Transaction {
  hash: string;
  from: string;
  to: string;
  // Montant en plus petite unité (wei / lamports / satoshis).
  // `null` quand l'indexeur n'a pas su le fournir : on affiche alors
  // "Montant indisponible", jamais un 0 qui se lirait comme un vrai montant.
  value: string | null;
  timeStamp: string;
  chain: 'ethereum' | 'solana' | 'bitcoin';
  // Renseigné quand la chaîne permet de le déterminer sûrement.
  // 'none' = aucun mouvement natif (frais payés par un tiers, jeton SPL).
  direction?: 'in' | 'out' | 'none' | 'unknown';
  failed?: boolean;
}

export interface WalletData {
  balanceEth?: string;
  balanceSol?: string;
  balanceBtc?: string;
  transactions: Transaction[];
}

export async function safeFetch<T>(url: string, options?: RequestInit, defaultValue?: T): Promise<T> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      }
    });
    if (!res.ok) {
      throw new Error(`Erreur réseau: ${res.status}`);
    }
    return await res.json() as T;
  } catch (error) {
    console.error(`Erreur fetch [${url}]:`, error);
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw error;
  }
}
