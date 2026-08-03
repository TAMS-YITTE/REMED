'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getChainFamily } from '@/lib/cryptoChains';
import { Loader2, ShieldCheck, ArrowRight, Wallet, RefreshCw } from 'lucide-react';
import { cryptoList } from '@/lib/cryptoList';

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

const STRIPE_SUPPORTED = new Set(['btc', 'eth', 'sol', 'usdc']);

interface BuyCryptoButtonProps {
  crypto: string;
  amount?: string;
  className?: string;
}

export function BuyCryptoButton({ crypto, amount, className = '' }: BuyCryptoButtonProps) {
  const router = useRouter();
  const {
    authenticated,
    login,
    user,
    walletAddress,
    solanaWalletAddress,
    bitcoinWalletAddress,
    createBitcoinWallet,
  } = useAuth();

  const [selectedCrypto, setSelectedCrypto] = useState(crypto.toLowerCase());
  const [customAmount, setCustomAmount] = useState(amount || '30');
  const [isLoading, setIsLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [payError, setPayError] = useState('');

  const chain        = getChainFamily(selectedCrypto);
  const currencyCode = MOONPAY_CURRENCY_CODE[selectedCrypto] ?? selectedCrypto;
  const apiKey =
    process.env.NEXT_PUBLIC_MOONPAY_API_KEY ||
    process.env.NEXT_PUBLIC_MOONPAY_KEY ||
    '';

  const activeWalletAddress =
    chain === 'solana'  ? solanaWalletAddress  :
    chain === 'bitcoin' ? bitcoinWalletAddress  :
    walletAddress;

  const numAmount = Number(customAmount) || 0;
  const isUnderMin = numAmount < 30;
  const displayAmount = numAmount >= 30 ? customAmount : '30';
  const enableStripeOnramp = process.env.NEXT_PUBLIC_ENABLE_STRIPE_ONRAMP === 'true';
  const canPayWithStripe = enableStripeOnramp && STRIPE_SUPPORTED.has(selectedCrypto);

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

      // Rattache l'achat au compte : le webhook MoonPay lit externalCustomerId
      // pour retrouver l'utilisateur (privy_id) et remplir sa colonne user_id.
      // Sans ça, la transaction est enregistrée avec user_id null et n'apparaît
      // dans l'historique d'aucun utilisateur.
      if (user?.id) params.set('externalCustomerId', user.id);

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
          crypto: selectedCrypto,
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

  const handleCryptoChange = (newSym: string) => {
    setSelectedCrypto(newSym);
    router.push(`/acheter/${newSym}?amount=${displayAmount}`);
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

      {/* Récapitulatif & Modificateurs */}
      <div className="bg-[#252844] border border-white/10 rounded-2xl p-5 text-left space-y-4 shadow-xl">
        {/* Sélecteur de Crypto */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 flex items-center justify-between">
            <span>Cryptomonnaie sélectionnée</span>
            <span className="text-[10px] text-indigo-300 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Changer l'actif</span>
          </label>
          <select
            value={selectedCrypto}
            onChange={(e) => handleCryptoChange(e.target.value)}
            className="w-full bg-[#1a1c2e] border border-indigo-500/40 focus:border-indigo-400 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none cursor-pointer uppercase transition-colors"
          >
            {cryptoList.filter(c => c.supported).map((c) => (
              <option key={c.id} value={c.id} className="bg-[#1a1c2e] text-white py-2">
                {c.name} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Montant à investir */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Montant à investir (€)</label>
          <div className="relative">
            <input
              type="number"
              min="30"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-[#1a1c2e] border border-indigo-500/40 focus:border-indigo-400 rounded-xl px-4 py-3 text-lg font-bold text-white outline-none transition-colors"
              placeholder="30"
            />
            <span className="absolute right-4 top-3 text-gray-400 font-semibold text-base">€ EUR</span>
          </div>
        </div>

        {/* Presets rapides */}
        <div className="flex items-center gap-2">
          {['30', '50', '100', '250', '500'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setCustomAmount(preset)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                customAmount === preset
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {preset} €
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-white/10 space-y-2 text-sm">
          <div className="flex items-center justify-between pt-1">
            <span className="text-gray-400 flex items-center gap-1">
              <Wallet className="w-4 h-4 text-indigo-400" /> Adresse de réception
            </span>
            <span className="font-mono text-xs text-gray-300 truncate max-w-[150px]">
              {activeWalletAddress ? `${activeWalletAddress.slice(0, 6)}...${activeWalletAddress.slice(-4)}` : 'Génération...'}
            </span>
          </div>
        </div>
      </div>

      {payError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-xs text-left">
          {payError}
        </div>
      )}

      {/* Paiement MoonPay */}
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

      {/* Paiement Stripe */}
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

      {/* Lien Retour au catalogue de cryptos avec Next.js Link */}
      <div className="pt-2 text-center">
        <Link
          href="/acheter"
          className="inline-flex items-center text-xs text-indigo-300 hover:text-white font-medium underline transition-colors"
        >
          ← Voir tout le catalogue des cryptos / Simulateur
        </Link>
      </div>

      <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Paiement sécurisé via nos partenaires réglementés. Crypto livrée directement sur votre portefeuille.
      </p>
    </div>
  );
}
