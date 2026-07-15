'use client';

import { useState } from 'react';
import { Copy, Check, Wallet } from 'lucide-react';

interface WalletBalanceProps {
  walletAddress: string;
  balance?: string;
  isLoading?: boolean;
}

export function WalletBalance({ walletAddress, balance, isLoading }: WalletBalanceProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#534AB7] to-[#3C3489] text-white border border-[#6b61c9] rounded-2xl p-6 shadow-lg">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-[#EEEDFE] opacity-10 rounded-full blur-xl"></div>
      
      <div className="relative flex justify-between items-start mb-8 z-10">
        <div>
          <h2 className="text-[13px] font-medium text-white/70 mb-1.5 uppercase tracking-wider">Solde Total (ETH Testnet)</h2>
          <div className="text-4xl font-semibold tracking-tight flex items-center gap-3">
            {isLoading ? (
              <div className="h-10 w-32 bg-white/20 animate-pulse rounded-lg"></div>
            ) : (
              <>{balance || "0.00"} <span className="text-xl text-white/80">ETH</span></>
            )}
          </div>
        </div>
        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
          <Wallet size={24} className="text-white" />
        </div>
      </div>

      <div className="relative bg-black/20 rounded-xl p-4 backdrop-blur-md border border-white/10 z-10">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-white/70 font-medium uppercase tracking-wider">
            Adresse sécurisée
          </div>
          <div className="text-[10px] text-white/90 bg-white/20 px-2 py-0.5 rounded-full font-medium border border-white/20">
            Généré par Privy
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <code className="text-[13px] text-white/90 truncate flex-1 tracking-wide">
            {walletAddress}
          </code>
          <button 
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 text-[13px] font-medium text-white bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors"
          >
            {copied ? <><Check size={14}/> Copié</> : <><Copy size={14}/> Copier</>}
          </button>
        </div>
      </div>
    </div>
  );
}
