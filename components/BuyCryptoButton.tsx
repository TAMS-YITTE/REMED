'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getChainFamily } from '@/lib/cryptoChains';
import { Loader2 } from 'lucide-react';

// Correspondance crypto Remedly → code devise MoonPay
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
  className?: string;
}

export function BuyCryptoButton({ crypto, className = '' }: BuyCryptoButtonProps) {
  const {
    authenticated,
    login,
    walletAddress,
    solanaWalletAddress,
    bitcoinWalletAddress,
    createBitcoinWallet,
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const chain         = getChainFamily(crypto);
  const currencyCode  = MOONPAY_CURRENCY_CODE[crypto.toLowerCase()] ?? crypto.toLowerCase();
  const apiKey        = process.env.NEXT_PUBLIC_MOONPAY_API_KEY ?? '';

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      // 1. Si non connecté → ouvrir login Privy d'abord
      if (!authenticated) {
        login();
        return;
      }

      // 2. Créer le wallet Bitcoin à la demande si nécessaire
      if (chain === 'bitcoin' && !bitcoinWalletAddress) {
        await createBitcoinWallet();
      }

      // 3. Choisir la bonne adresse selon la blockchain
      const address =
        chain === 'solana'  ? solanaWalletAddress  :
        chain === 'bitcoin' ? bitcoinWalletAddress  :
        walletAddress;

      if (!address) {
        console.error('Aucune adresse de portefeuille disponible.');
        return;
      }

      // 4. Construire l'URL MoonPay avec la clé partenaire
      const params = new URLSearchParams({
        apiKey:        apiKey,
        walletAddress: address,
        currencyCode:  currencyCode,
        colorCode:     '#6366f1',   // Couleur indigo de Remedly
        language:      'fr',
        showWalletAddressForm: 'false',
      });

      const moonpayUrl = `https://buy.moonpay.com?${params.toString()}`;

      // 5. Ouvrir MoonPay dans une popup centrée
      const width  = 450;
      const height = 680;
      const left   = Math.round(window.innerWidth  / 2 - width  / 2);
      const top    = Math.round(window.innerHeight / 2 - height / 2);

      window.open(
        moonpayUrl,
        'moonpay_purchase',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );
    } catch (error) {
      console.error("Erreur lors du lancement de l'achat :", error);
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
