'use client';

import { useAuth } from '@/hooks/useAuth';
import { BuyCryptoButton } from '@/components/BuyCryptoButton';
import { BankTransferGuideCard } from '@/components/BankTransferGuideCard';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

function AcheterContent() {
  const searchParams = useSearchParams();
  const crypto = searchParams.get('crypto') || 'eth';
  const amount = searchParams.get('amount') || undefined;

  return (
    <div className="w-full max-w-6xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-8">
        <Link href="/portefeuille" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au portefeuille
        </Link>
        <span className="text-xs font-semibold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
          Achat de Crypto-actifs Sécurisé
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Colonne Gauche : Guide Virement Sans Frais */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <BankTransferGuideCard />
        </div>

        {/* Colonne Droite : Pavé d'Achat */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <div className="bg-[#2E3152] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Acheter du <span className="text-indigo-400 uppercase">{crypto}</span>
            </h1>
            <p className="text-gray-400 text-xs mb-6">
              Paiement sécurisé par carte bancaire ou virement bancaire SEPA.
            </p>
            
            <BuyCryptoButton crypto={crypto} amount={amount} className="w-full" />
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500 leading-relaxed text-center">
                Les services d'achat et de transfert sont opérés par nos partenaires réglementés (Stripe, MoonPay). 
                Remedly est une interface non-hébergée (non-custodial).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AcheterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="text-center mt-20 text-gray-400">Chargement de la plateforme d'achat...</div>}>
          <AcheterContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
