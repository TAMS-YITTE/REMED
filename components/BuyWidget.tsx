'use client';

import { useState, useEffect } from 'react';
import { MoonPayWidget } from './MoonPayWidget';
import { TransakWidget } from './TransakWidget';
import { useAuth } from '@/hooks/useAuth';
import { getChainFamily } from '@/lib/cryptoChains';

interface BuyWidgetProps {
  crypto?: string;
}

export function BuyWidget({ crypto = 'eth' }: BuyWidgetProps) {
  const [provider, setProvider] = useState<'moonpay' | 'transak'>('transak');
  const { walletAddress, solanaWalletAddress, bitcoinWalletAddress, createBitcoinWallet } = useAuth();

  const chain = getChainFamily(crypto);

  useEffect(() => {
    if (chain === 'bitcoin' && !bitcoinWalletAddress) {
      createBitcoinWallet().catch(console.error);
    }
  }, [chain, bitcoinWalletAddress, createBitcoinWallet]);

  if (!chain) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[600px] bg-[#2E3152] border border-white/10 rounded-xl text-center p-6">
        <h3 className="text-lg font-semibold text-white mb-2">{crypto.toUpperCase()} arrive bientôt</h3>
        <p className="text-gray-400 text-sm max-w-sm">
          Cette cryptomonnaie tourne sur un réseau que notre portefeuille ne
          prend pas encore en charge. Elle sera disponible à l&apos;achat dès
          que ce sera le cas.
        </p>
      </div>
    );
  }

  const activeWalletAddress = chain === 'solana' ? solanaWalletAddress : chain === 'bitcoin' ? bitcoinWalletAddress : walletAddress;

  if (!activeWalletAddress) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[600px] bg-[#2E3152] border border-white/10 rounded-xl text-center p-6">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-semibold text-white mb-2">Création de votre portefeuille...</h3>
        <p className="text-gray-400 text-sm max-w-sm">
          Veuillez patienter quelques instants pendant que nous générons votre portefeuille crypto sécurisé.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Global Warning Banner for pending KYC/KYB on Transak/MoonPay */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3 items-start text-left">
        <div className="text-amber-500 shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
          </svg>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-500">Demande d'autorisation en cours</h4>
          <p className="text-xs text-amber-400/80 mt-1">
            Les services d'achat par carte (MoonPay et Transak) sont actuellement en attente de validation. Le service sera bientôt activé.
          </p>
        </div>
      </div>

      {provider === 'moonpay' ? (
        <MoonPayWidget crypto={crypto.toLowerCase()} walletAddress={activeWalletAddress} />
      ) : (
        <TransakWidget crypto={crypto.toUpperCase()} walletAddress={activeWalletAddress} />
      )}

      {/* Encart visible et élégant pour basculer de fournisseur si l'un est bloqué */}
      <details className="mt-6 group">
        <summary className="text-sm text-gray-400 hover:text-indigo-400 cursor-pointer text-center list-none outline-none font-medium">
          Problème d'affichage ? Cliquez ici.
        </summary>
        <div className="mt-4 p-4 bg-[#2E3152] rounded-xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-0">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-full text-indigo-400 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-indigo-300">
                Écran blanc ou widget bloqué ?
              </h4>
              <p className="text-xs text-indigo-200 mt-1">
                Il arrive que {provider === 'moonpay' ? 'MoonPay' : 'Transak'} soit bloqué par certaines sécurités de navigateur. Essayez l'autre fournisseur.
              </p>
            </div>
          </div>
          <button
            onClick={() => setProvider(p => p === 'moonpay' ? 'transak' : 'moonpay')}
            className="w-full sm:w-auto whitespace-nowrap px-4 py-2 bg-[#252844] border border-indigo-500/50 hover:bg-indigo-500/20 text-indigo-300 text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            Utiliser {provider === 'moonpay' ? 'Transak' : 'MoonPay'}
          </button>
        </div>
      </details>
    </div>
  );
}
