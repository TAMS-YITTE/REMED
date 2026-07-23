'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFundWallet } from '@privy-io/react-auth';
import { getChainFamily } from '@/lib/cryptoChains';
import { Loader2 } from 'lucide-react';

interface BuyCryptoButtonProps {
  crypto: string;
  className?: string;
}

export function BuyCryptoButton({ crypto, className = '' }: BuyCryptoButtonProps) {
  const { authenticated, login, walletAddress, solanaWalletAddress, bitcoinWalletAddress, createBitcoinWallet } = useAuth();
  const { fundWallet } = useFundWallet();
  const [isLoading, setIsLoading] = useState(false);

  const chain = getChainFamily(crypto);
  const activeWalletAddress = chain === 'solana' ? solanaWalletAddress : chain === 'bitcoin' ? bitcoinWalletAddress : walletAddress;

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      if (!authenticated) {
        login();
        return;
      }

      if (chain === 'bitcoin' && !bitcoinWalletAddress) {
        await createBitcoinWallet();
      }

      const finalAddress = chain === 'solana' ? solanaWalletAddress : chain === 'bitcoin' ? bitcoinWalletAddress : walletAddress;

      if (!finalAddress) {
        console.error('Aucune adresse de portefeuille disponible pour ce réseau.');
        return;
      }

      await fundWallet(finalAddress);
    } catch (error) {
      console.error('Erreur lors du lancement de l\'achat :', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuy}
      disabled={isLoading}
      className={`
        relative overflow-hidden group flex items-center justify-center gap-2 
        bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
        text-white font-bold py-4 px-8 rounded-xl shadow-[0_8px_20px_rgb(79,70,229,0.3)]
        hover:shadow-[0_8px_25px_rgb(79,70,229,0.5)] hover:-translate-y-0.5 
        transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      )}
      <span>Acheter du {crypto.toUpperCase()}</span>
      
      {/* Micro-animation hover (Shine effect) */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
    </button>
  );
}
