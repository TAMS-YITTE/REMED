'use server';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
}

export interface WalletData {
  balanceEth: string;
  transactions: Transaction[];
}

export async function getWalletData(address: string): Promise<WalletData> {
  // On utilise Sepolia (le réseau de test d'Ethereum) pour le moment.
  // Pour la production, on basculera sur api.etherscan.io
  const ETHERSCAN_API = 'https://api-sepolia.etherscan.io/api';
  
  try {
    // 1. Récupérer le solde (en Wei)
    const balanceRes = await fetch(`${ETHERSCAN_API}?module=account&action=balance&address=${address}&tag=latest`, { next: { revalidate: 10 } });
    const balanceData = await balanceRes.json();
    
    // Convertir de Wei vers ETH (1 ETH = 10^18 Wei)
    let balanceEth = "0.00";
    if (balanceData.status === "1" && balanceData.result) {
      const wei = BigInt(balanceData.result);
      // Approximation simple pour l'affichage (divide by 10^14 and then by 10000 for 4 decimals)
      const ethVal = Number(wei / BigInt(10 ** 14)) / 10000;
      balanceEth = ethVal.toFixed(4);
    }

    // 2. Récupérer les dernières transactions
    const txRes = await fetch(`${ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&sort=desc`, { next: { revalidate: 10 } });
    const txData = await txRes.json();
    
    let transactions: Transaction[] = [];
    if (txData.status === "1" && Array.isArray(txData.result)) {
      transactions = txData.result.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timeStamp: tx.timeStamp
      }));
    }

    return {
      balanceEth,
      transactions
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données blockchain :", error);
    return {
      balanceEth: "0.00",
      transactions: []
    };
  }
}
