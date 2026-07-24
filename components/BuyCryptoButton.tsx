'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getChainFamily } from '@/lib/cryptoChains';
import { Loader2, ShieldCheck, ArrowRight, Wallet } from 'lucide-react';

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

// Cryptos que Stripe onramp sert aux acheteurs France/EU (voir la liste
// autorisée côté serveur dans app/api/stripe/onramp/route.ts). Pour les
// autres, seul MoonPay est proposé.
const STRIPE_SUPPORTED = new Set(['btc', 'eth', 'sol', 'usdc']);

interface BuyCryptoButtonProps {
  crypto: string;
  amount?: string;
  className?: string;
}

export function BuyCryptoButton({ crypto, amount, className = '' }: BuyCryptoButtonProps) {
  const {
    authenticated,
    login,
    user,
    walletAddress,
    solanaWalletAddress,
    bitcoinWalletAddress,
    createBitcoinWallet,
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [payError, setPayError] = useState('');

  const chain        = getChainFamily(crypto);
  const currencyCode = MOONPAY_CURRENCY_CODE[crypto.toLowerCase()] ?? crypto.toLowerCase();
  const apiKey =
    process.env.NEXT_PUBLIC_MOONPAY_API_KEY ||
    process.env.NEXT_PUBLIC_MOONPAY_KEY ||
    '';

  const activeWalletAddress =
    chain === 'solana'  ? solanaWalletAddress  :
    chain === 'bitcoin' ? bitcoinWalletAddress  :
    walletAddress;

  const isUnderMin = amount ? Number(amount) < 30 : false;
  const displayAmount = amount && Number(amount) >= 30 ? amount : '30';
  const canPayWithStripe = STRIPE_SUPPORTED.has(crypto.toLowerCase());

  // Résout l'adresse de réception pour la chaîne courante, en créant le wallet
  // Bitcoin à la demande si besoin. Partagée entre MoonPay et Stripe.
  const resolveAddress = async (): Promise<string | null> => {
    if (chain === 'bitcoin' && !bitcoinWalletAddress) {
      await createBitcoinWallet();
    }
    const finalAddress =
      chain === 'solana'  ? solanaWalletAddress  :
      chain === 'bitcoin' ? bitcoinWalletAddress  :
      walletAddress;
    return finalAddress ?? null;
  };

  const openCentered = (url: string, name: string) => {
    const width  = 460;
    const height = 700;
    const left   = Math.round(window.innerWidth / 2 - width / 2);
    const top    = Math.round(window.innerHeight / 2 - height / 2);
    window.open(
      url,
      name,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const handleBuy = async () => {
    setPayError('');
    setIsLoading(true);
    try {
      if (!authenticated) {
        login();
        return;
      }

      const finalAddress = await resolveAddress();
      if (!finalAddress) {
        setPayError('Aucune adresse de portefeuille disponible.');
        return;
      }

      const params = new URLSearchParams({
        apiKey: apiKey,
        currencyCode: currencyCode,
        walletAddress: finalAddress,
        baseCurrencyCode: 'eur',
        baseCurrencyAmount: displayAmount,
        colorCode: '#6366f1',
        theme: 'dark',
        language: 'fr',
        showWalletAddressForm: 'false',
      });

      openCentered(`https://buy.moonpay.com?${params.toString()}`, 'moonpay_checkout');
    } catch (error) {
      console.error("Erreur lors du lancement de l'achat :", error);
      setPayError("Une erreur est survenue lors du lancement du paiement.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripe = async () => {
    setPayError('');
    setStripeLoading(true);
    try {
      if (!authenticated) {
        login();
        return;
      }

      const finalAddress = await resolveAddress();
      if (!finalAddress) {
        setPayError('Aucune adresse de portefeuille disponible.');
        return;
      }

      const res = await fetch('/api/stripe/onramp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crypto: crypto.toLowerCase(),
          amount: displayAmount,
          walletAddress: finalAddress,
          privyId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) {
        setPayError(data?.error || "Impossible de lancer le paiement Stripe.");
        return;
      }

      openCentered(data.url, 'stripe_onramp');
    } catch (error) {
      console.error('Erreur lors du lancement du paiement Stripe :', error);
      setPayError('Erreur réseau lors du paiement Stripe.');
    } finally {
      setStripeLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
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

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      {isUnderMin && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-3 text-xs text-left flex items-start gap-2">
          <span className="text-sm">⚠️</span>
          <span>
            <strong>Montant minimum d'achat : 30 €</strong>. Votre montant a été automatiquement ajusté au seuil minimum.
          </span>
        </div>
      )}

      {/* Récapitulatif de l'achat */}
      <div className="bg-[#252844] border border-white/10 rounded-2xl p-5 text-left space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Montant estimé</span>
          <span className="font-bold text-white text-lg">{displayAmount} €</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Crypto sélectionnée</span>
          <span className="font-semibold text-indigo-300 uppercase">{crypto}</span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
          <span className="text-gray-400 flex items-center gap-1">
            <Wallet className="w-4 h-4 text-indigo-400" /> Adresse de réception
          </span>
          <span className="font-mono text-xs text-gray-300 truncate max-w-[150px]">
            {activeWalletAddress ? `${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}` : 'Génération...'}
          </span>
        </div>
      </div>

      {payError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-xs text-left">
          {payError}
        </div>
      )}

      {/* Paiement MoonPay (disponible pour toutes les cryptos) */}
      <button
        onClick={handleBuy}
        disabled={isLoading || stripeLoading}
        className="w-full relative overflow-hidden group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
        )}
        <span>Payer {displayAmount} € avec MoonPay</span>
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Paiement Stripe (BTC, ETH, SOL, USDC uniquement) */}
      {canPayWithStripe && (
        <button
          onClick={handleStripe}
          disabled={isLoading || stripeLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#252844] hover:bg-[#2d3152] border border-white/15 text-white font-semibold py-3.5 px-8 rounded-xl transition-all duration-200 disabled:opacity-70"
        >
          {stripeLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          <span>Payer {displayAmount} € avec Stripe</span>
        </button>
      )}

      <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Paiement sécurisé via nos partenaires réglementés. Crypto livrée directement sur votre portefeuille.
      </p>
    </div>
  );
}
