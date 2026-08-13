import { Transaction } from '@/app/actions/utils';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
  walletAddress?: string; // used to detect incoming/outgoing for ETH (to === walletAddress)
}

export function TransactionHistory({ transactions, isLoading, walletAddress }: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#252844] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-gray-400">💸</span>
          </div>
          <p className="text-sm text-gray-400">Aucune transaction pour le moment.</p>
          <p className="text-[13px] text-gray-500 mt-1">Votre historique s'affichera ici après votre premier achat.</p>
        </div>
      </div>
    );
  }

  const getExplorerUrl = (tx: Transaction) => {
    switch (tx.chain) {
      case 'ethereum': return `https://etherscan.io/tx/${tx.hash}`;
      case 'solana': return `https://solscan.io/tx/${tx.hash}`;
      case 'bitcoin': return `https://mempool.space/tx/${tx.hash}`;
      default: return '#';
    }
  };

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case 'ethereum': return 'Ξ';
      case 'solana': return 'S';
      case 'bitcoin': return '₿';
      default: return '?';
    }
  };

  return (
    <div className="divide-y divide-white/10">
      {transactions.map((tx) => {
        // Sens du mouvement : les actions qui savent le déterminer le posent
        // dans `tx.direction` (SOL, via la variation de solde). Sinon on le
        // déduit des adresses.
        // - ETH: from/to sont de vraies adresses.
        // - BTC: from="Bitcoin Network", to=address (si entrant)
        let direction: NonNullable<Transaction['direction']>;
        if (tx.direction) {
          direction = tx.direction;
        } else if (tx.chain === 'ethereum' && walletAddress) {
          direction = tx.to.toLowerCase() === walletAddress.toLowerCase() ? 'in' : 'out';
        } else {
          direction = tx.from.includes('Network') ? 'in' : 'out';
        }

        const isIncoming = direction === 'in';
        const isNeutral = direction === 'none' || direction === 'unknown';

        const sign = isNeutral ? '' : isIncoming ? '+' : '-';
        const color = isNeutral ? 'text-gray-400' : isIncoming ? 'text-green-400' : 'text-gray-300';
        const bgColor = isIncoming ? 'bg-green-500/20' : 'bg-white/10';
        const icon = isNeutral ? '•' : isIncoming ? '↓' : '↑';
        const label = isNeutral ? 'Mouvement' : isIncoming ? 'Reçu' : 'Envoyé';

        // Un montant qu'on n'a pas pu lire n'est pas un montant nul :
        // on le dit, plutôt que d'afficher "0".
        let valueDisplay: string;
        if (tx.value === null) {
          valueDisplay = 'Montant indisponible';
        } else if (tx.chain === 'ethereum') {
          valueDisplay = `${(Number(tx.value) / 10**18).toFixed(4)} ETH`;
        } else if (tx.chain === 'solana') {
          valueDisplay = `${(Number(tx.value) / 10**9).toFixed(6)} SOL`;
        } else {
          valueDisplay = `${(Number(tx.value) / 10**8).toFixed(5)} BTC`;
        }

        return (
          <div key={tx.hash} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor} ${color}`}>
                {icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">
                    {label}
                  </p>
                  <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded uppercase font-medium">
                    {getChainIcon(tx.chain)} {tx.chain}
                  </span>
                  {tx.failed && (
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded uppercase font-medium">
                      Échouée
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(parseInt(tx.timeStamp) * 1000).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${color}`}>
                {sign}{valueDisplay}
              </p>
              <a href={getExplorerUrl(tx)} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline">
                Voir
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
