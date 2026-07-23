'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getChainFamily } from '@/lib/cryptoChains';
import { Loader2 } from 'lucide-react';

const MOONPAY_CURRENCY_CODE: Record<string, string> = {
  btc:  'btc',
  eth:  'eth',
  sol:  'sol',
  usdc: 'usdc',
  avax: 'avax_cchain',
  link: 'link',
  pol:  'pol_polygon',
  shib: 'shib',
  uni:  'uni',
};

interface BuyCryptoButtonProps {
  crypto: string;
  amount?: string;
  className?: string;
}

export function BuyCryptoButton({ crypto, amount, className = '' }: BuyCryptoButtonProps) {
  const {
    authenticated,
    login,
    walletAddress,
    solanaWalletAddress,
    bitcoinWalletAddress,
    createBitcoinWallet,
  } = useAuth();

  const [isInitializing, setIsInitializing] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const chain        = getChainFamily(crypto);
  const currencyCode = MOONPAY_CURRENCY_CODE[crypto.toLowerCase()] ?? crypto.toLowerCase();
  const apiKey       = process.env.NEXT_PUBLIC_MOONPAY_API_KEY ?? '';

  const activeWalletAddress =
    chain === 'solana'  ? solanaWalletAddress  :
    chain === 'bitcoin' ? bitcoinWalletAddress  :
    walletAddress;

  useEffect(() => {
    if (authenticated && chain === 'bitcoin' && !bitcoinWalletAddress) {
      setIsInitializing(true);
      createBitcoinWallet()
        .catch(console.error)
        .finally(() => setIsInitializing(false));
    }
  }, [authenticated, chain, bitcoinWalletAddress, createBitcoinWallet]);

  // Si l'utilisateur n'est pas connecté → afficher le bouton de connexion
  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <button
          onClick={login}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200"
        >
          Créer un compte ou Se connecter
        </button>
        <p className="text-xs text-gray-400 mt-3">
          Un portefeuille non-custodial sécurisé sera généré automatiquement.
        </p>
      </div>
    );
  }

  // Chargement du wallet Bitcoin si nécessaire
  if (isInitializing || (chain && !activeWalletAddress)) {
    return (
      <div className="flex flex-col items-center justify-center h-[550px] w-full bg-[#252844] rounded-2xl p-6 text-center border border-white/10">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <h4 className="text-lg font-semibold text-white mb-1">Préparation du portefeuille...</h4>
        <p className="text-sm text-gray-400">Génération de votre adresse sécurisée pour {crypto.toUpperCase()}</p>
      </div>
    );
  }

  // Montant valide pour MoonPay (minimum 30€, fallback 50€)
  const initialAmount = amount && Number(amount) >= 30 ? amount : '50';

  // Construction de l'URL du Widget MoonPay
  const params = new URLSearchParams({
    apiKey: apiKey,
    currencyCode: currencyCode,
    walletAddress: activeWalletAddress || '',
    baseCurrencyCode: 'eur',
    baseCurrencyAmount: initialAmount,
    colorCode: '#6366f1',
    theme: 'dark',
    language: 'fr',
    showWalletAddressForm: 'false',
  });

  const widgetUrl = `https://buy.moonpay.com?${params.toString()}`;

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      <div className="relative w-full h-[620px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#1e2139]">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#252844] z-10">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
            <span className="text-sm text-gray-300">Chargement du paiement sécurisé MoonPay...</span>
          </div>
        )}
        <iframe
          src={widgetUrl}
          onLoad={() => setIframeLoaded(true)}
          allow="camera;microphone;payment"
          className="w-full h-full border-none rounded-2xl"
          title={`Acheter du ${crypto.toUpperCase()} avec MoonPay`}
        />
      </div>
    </div>
  );
}
