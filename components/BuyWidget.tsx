'use client';

import { useState } from 'react';
import { MoonPayWidget } from './MoonPayWidget';
import { TransakWidget } from './TransakWidget';
import { useAuth } from '@/hooks/useAuth';
import { getChainFamily } from '@/lib/cryptoChains';

interface BuyWidgetProps {
  crypto?: string;
}

export function BuyWidget({ crypto = 'eth' }: BuyWidgetProps) {
  const [provider, setProvider] = useState<'moonpay' | 'transak'>('transak');
  const { walletAddress, solanaWalletAddress } = useAuth();

  const chain = getChainFamily(crypto);

  if (chain === 'bitcoin') {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[600px] bg-gray-50 border border-gray-200 rounded-xl text-center p-6">
        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4 text-xl">₿</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Bitcoin bientôt disponible</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          L'achat de Bitcoin n'est pas encore pris en charge par ton portefeuille Remedly. Essaie Ethereum ou Solana en attendant.
        </p>
      </div>
    );
  }

  const activeWalletAddress = chain === 'solana' ? solanaWalletAddress : walletAddress;

  if (!activeWalletAddress) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[600px] bg-gray-50 border border-gray-200 rounded-xl text-center p-6">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Création de votre portefeuille...</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Veuillez patienter quelques instants pendant que nous générons votre portefeuille crypto sécurisé.
        </p>
      </div>
    );
  }

  return (
    <div>
      {provider === 'moonpay' ? (
        <MoonPayWidget crypto={crypto.toLowerCase()} walletAddress={activeWalletAddress} />
      ) : (
        <TransakWidget crypto={crypto.toUpperCase()} walletAddress={activeWalletAddress} />
      )}

      {/* Lien discret pour basculer si problème */}
      <p
        style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 12, cursor: 'pointer' }}
        onClick={() => setProvider(p => p === 'moonpay' ? 'transak' : 'moonpay')}
      >
        Problème avec le paiement ? Essaie une autre méthode
      </p>
    </div>
  );
}
