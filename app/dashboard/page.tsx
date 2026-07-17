'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthButton } from '@/components/AuthButton';
import Link from 'next/link';

function CopyableAddress({ label, address }: { label: string; address?: string }) {
  const [copied, setCopied] = useState(false);

  if (!address) {
    return (
      <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-gray-500">Non créé</span>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
      <div className="min-w-0">
        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
        <div className="text-sm text-white font-mono truncate">{address}</div>
      </div>
      <button
        onClick={handleCopy}
        className="shrink-0 text-xs font-medium text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
      >
        {copied ? 'Copié !' : 'Copier'}
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { isReady, authenticated, user, walletAddress, solanaWalletAddress, bitcoinWalletAddress } = useAuth();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#252844]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#252844] px-6 text-center">
        <h1 className="text-2xl font-semibold text-white mb-2">Accès restreint</h1>
        <p className="text-gray-400 mb-6 max-w-md">
          Vous devez être connecté pour accéder à votre espace.
        </p>
        <AuthButton />
      </div>
    );
  }

  const email = user?.email?.address as string | undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mon espace</h1>
        <p className="text-gray-400 mb-8">
          Retrouvez les informations de votre compte et de votre portefeuille non-custodial.
        </p>

        <section className="glass-panel rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Compte</h2>
          <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-xs text-gray-400">E-mail</span>
            <span className="text-sm text-white">{email || 'Non disponible'}</span>
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Adresses de portefeuille</h2>
          <div className="flex flex-col gap-3">
            <CopyableAddress label="Ethereum / EVM" address={walletAddress} />
            <CopyableAddress label="Solana" address={solanaWalletAddress} />
            <CopyableAddress label="Bitcoin (Taproot)" address={bitcoinWalletAddress} />
          </div>
        </section>

        <section className="glass-panel rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Historique des transactions</h2>
          <p className="text-sm text-gray-400">
            Bientôt disponible. En attendant, retrouvez vos soldes et vos dernières transactions sur votre{' '}
            <Link href="/portefeuille" className="text-indigo-400 hover:underline">
              page portefeuille
            </Link>
            .
          </p>
        </section>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/portefeuille"
            className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold py-3 rounded-xl"
          >
            Voir mon portefeuille
          </Link>
          <Link
            href="/acheter"
            className="flex-1 text-center bg-white/5 hover:bg-white/10 transition-colors text-white font-semibold py-3 rounded-xl border border-white/10"
          >
            Acheter des cryptos
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
