'use client';

import { useState } from 'react';

interface WalletBalanceProps {
  walletAddress: string;
}

export function WalletBalance({ walletAddress }: WalletBalanceProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">Solde Total (Est.)</h2>
          <div className="text-4xl font-semibold text-gray-900 tracking-tight">
            0,00 €
          </div>
        </div>
        <div className="bg-[#EEEDFE] text-[#534AB7] p-2.5 rounded-lg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5H5a2 2 0 0 0 0 4h16V5" />
            <circle cx="15" cy="12" r="2" />
          </svg>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="text-xs text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Votre adresse sécurisée</div>
        <div className="flex items-center justify-between gap-3">
          <code className="text-[13px] text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 truncate flex-1">
            {walletAddress}
          </code>
          <button 
            onClick={handleCopy}
            className="shrink-0 text-sm font-medium text-[#534AB7] bg-white border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
          >
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
      </div>
    </div>
  );
}
