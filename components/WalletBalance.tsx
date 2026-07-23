'use client';

import { useState } from 'react';
import { Copy, Check, Wallet } from 'lucide-react';

interface WalletBalanceProps {
  walletAddress: string;
  solanaWalletAddress?: string;
  bitcoinWalletAddress?: string;
  balance?: string;
  solanaBalance?: string;
  bitcoinBalance?: string;
  erc20Balances?: Record<string, string>;
  prices?: Record<string, number> | null;
  isLoading?: boolean;
  isLoadingSolana?: boolean;
  isLoadingBitcoin?: boolean;
  isLoadingErc20?: boolean;
  onCreateBitcoinWallet?: () => void;
}

// Defined at module scope (not inside WalletBalance) so React treats it as
// the same component across renders and updates it in place instead of
// unmounting/remounting it every time copiedAddress changes.
function AddressRow({
  label,
  address,
  copied,
  onCopy,
  onGenerate,
  balance,
  isLoadingBalance,
  symbol,
  priceEur,
}: {
  label: string;
  address?: string;
  copied?: boolean;
  onCopy?: (address: string) => void;
  onGenerate?: () => void;
  balance?: string;
  isLoadingBalance?: boolean;
  symbol?: string;
  priceEur?: number;
}) {
  if (!address) {
    if (onGenerate) {
      return (
        <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-lg border border-white/10 border-dashed">
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-[11px] text-indigo-100 font-medium uppercase tracking-wider mb-0.5">{label}</span>
            <span className="text-[12px] text-white/50 italic">Non générée</span>
          </div>
          <button
            onClick={onGenerate}
            className="shrink-0 text-[11px] font-medium text-white bg-indigo-500/30 border border-indigo-400/30 px-3 py-1.5 rounded-md hover:bg-indigo-500/50 transition-colors"
          >
            Générer
          </button>
        </div>
      );
    }
    return null;
  }
  return (
    <div className="flex items-center justify-between gap-3 bg-white/10 p-3 rounded-lg border border-white/10 hover:bg-white/15 transition-colors">
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[11px] text-indigo-100 font-medium uppercase tracking-wider">{label}</span>
          {symbol && (
            <div className="text-[12px] font-medium text-white">
              {isLoadingBalance ? (
                <div className="h-4 w-12 bg-white/20 animate-pulse rounded"></div>
              ) : (
                <>
                  {balance || "0.00"} <span className="text-white/60 text-[10px]">{symbol}</span>
                  {priceEur !== undefined && balance && (
                    <span className="text-white/40 text-[10px] ml-1 font-normal">(~{(parseFloat(balance) * priceEur).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })})</span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <code className="text-[13px] text-white/80 truncate tracking-wide">
          {address}
        </code>
      </div>
      <button
        onClick={() => onCopy?.(address)}
        className="shrink-0 flex items-center justify-center w-8 h-8 text-white bg-white/10 border border-white/20 rounded-md hover:bg-white/20 transition-colors"
        title="Copier l'adresse"
      >
        {copied ? <Check size={14} className="text-green-300"/> : <Copy size={14}/>}
      </button>
    </div>
  );
}

export function WalletBalance({ 
  walletAddress, 
  solanaWalletAddress, 
  bitcoinWalletAddress, 
  balance, 
  solanaBalance,
  bitcoinBalance,
  erc20Balances,
  prices,
  isLoading, 
  isLoadingSolana,
  isLoadingBitcoin,
  isLoadingErc20,
  onCreateBitcoinWallet 
}: WalletBalanceProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const totalEur = prices ? (
    (parseFloat(balance || "0") * prices.eth) +
    (parseFloat(solanaBalance || "0") * prices.sol) +
    (parseFloat(bitcoinBalance || "0") * prices.btc)
  ) : null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#41389D] to-[#2B2466] text-white border border-[#534AB7] rounded-2xl p-6 shadow-xl">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-[#EEEDFE] opacity-10 rounded-full blur-xl"></div>
      
      <div className="relative flex justify-between items-start mb-8 z-10">
        <div>
          <h2 className="text-[13px] font-medium text-indigo-100 mb-1.5 uppercase tracking-wider">Solde Total</h2>
          <div className="text-4xl font-semibold tracking-tight flex flex-col gap-1">
            {isLoading || (prices === undefined) ? (
              <div className="h-10 w-32 bg-white/10 animate-pulse rounded-lg"></div>
            ) : totalEur !== null ? (
              <div className="flex items-baseline gap-2">
                {totalEur.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                {balance || "0.00"} <span className="text-xl text-indigo-100">ETH</span>
              </div>
            )}
            
            {totalEur !== null && (
              <div className="text-sm font-normal text-indigo-200 mt-1 flex items-center gap-3">
                <span>≈ {solanaBalance || "0.00"} SOL</span>
                <span>•</span>
                <span>{balance || "0.00"} ETH</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
          <Wallet size={24} className="text-white" />
        </div>
      </div>

      <div className="relative bg-black/25 rounded-xl p-5 backdrop-blur-md border border-white/5 z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xs text-indigo-100 font-medium uppercase tracking-wider">
            Adresses sécurisées
          </div>
          <div className="text-[10px] text-white/90 bg-indigo-500/30 px-2 py-0.5 rounded-full font-medium border border-indigo-400/30">
            Généré par Privy
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <AddressRow label="Ethereum / EVM" address={walletAddress} copied={copiedAddress === walletAddress} onCopy={handleCopy} balance={balance} isLoadingBalance={isLoading} symbol="ETH" priceEur={prices?.eth} />
          {erc20Balances && Object.entries(erc20Balances).filter(([_, bal]) => parseFloat(bal) > 0 || isLoadingErc20).map(([sym, bal]) => (
            <div key={sym} className="flex items-center justify-between gap-3 bg-white/5 p-2 rounded-lg border border-white/5 ml-4">
              <span className="text-[11px] text-indigo-100 font-medium">{sym} (ERC-20)</span>
              <div className="text-[12px] font-medium text-white">
                {isLoadingErc20 ? (
                  <div className="h-4 w-12 bg-white/20 animate-pulse rounded"></div>
                ) : (
                  <>{bal} <span className="text-white/60 text-[10px]">{sym}</span></>
                )}
              </div>
            </div>
          ))}
          <AddressRow label="Solana" address={solanaWalletAddress} copied={copiedAddress === solanaWalletAddress} onCopy={handleCopy} balance={solanaBalance} isLoadingBalance={isLoadingSolana} symbol="SOL" priceEur={prices?.sol} />
          <AddressRow label="Bitcoin (Taproot)" address={bitcoinWalletAddress} copied={copiedAddress === bitcoinWalletAddress} onCopy={handleCopy} onGenerate={onCreateBitcoinWallet} balance={bitcoinBalance} isLoadingBalance={isLoadingBitcoin} symbol="BTC" priceEur={prices?.btc} />
        </div>
      </div>
    </div>
  );
}
