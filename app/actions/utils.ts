export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
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
