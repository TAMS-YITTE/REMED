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
          <div className="w-12 h-12 bg-[#1B1C3E] rounded-full flex items-center justify-center mx-auto mb-3">
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
      case 'ethereum': return `https://sepolia.etherscan.io/tx/${tx.hash}`;
      case 'solana': return `https://solscan.io/tx/${tx.hash}?cluster=devnet`;
      case 'bitcoin': return `https://mempool.space/testnet/tx/${tx.hash}`;
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
        // For ETH we know if it's incoming by comparing tx.to with walletAddress
        // For BTC/SOL, our mock sets "Reçu" or "Envoyé" directly in `tx.from` or `tx.to` sometimes,
        // or we just default to "Mouvement" if unclear.
        // In our actions: 
        // - ETH: from/to are actual addresses.
        // - SOL: from="Solana Network" or "Erreur", to=address
        // - BTC: from="Bitcoin Network", to=address (if incoming)
        
        let isIncoming = true;
        if (tx.chain === 'ethereum' && walletAddress) {
          isIncoming = tx.to.toLowerCase() === walletAddress.toLowerCase();
        } else if (tx.chain === 'bitcoin' || tx.chain === 'solana') {
          isIncoming = tx.from.includes('Network');
        }

        const sign = isIncoming ? '+' : '-';
        const color = isIncoming ? 'text-green-400' : 'text-gray-300';
        const bgColor = isIncoming ? 'bg-green-500/20' : 'bg-white/10';
        const icon = isIncoming ? '↓' : '↑';
        
        let valueDisplay = '';
        if (tx.chain === 'ethereum') {
          valueDisplay = `${(Number(tx.value) / 10**18).toFixed(4)} ETH`;
        } else if (tx.chain === 'solana') {
          valueDisplay = `${tx.value} SOL`; // Our solana.ts mock returns '0' currently
        } else if (tx.chain === 'bitcoin') {
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
                    {isIncoming ? 'Reçu' : 'Envoyé'}
                  </p>
                  <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded uppercase font-medium">
                    {getChainIcon(tx.chain)} {tx.chain}
                  </span>
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
