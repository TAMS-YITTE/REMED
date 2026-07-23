'use client';

import { useAuth } from '@/hooks/useAuth';
import { BuyCryptoButton } from '@/components/BuyCryptoButton';
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
    <div className="w-full max-w-lg mx-auto py-8 px-4 sm:px-0 text-center">
      <div className="flex justify-center mb-6">
        <Link href="/portefeuille" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au portefeuille
        </Link>
      </div>

      <div className="bg-[#2E3152] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Acheter du {crypto.toUpperCase()}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Paiement sécurisé par carte bancaire ou virement bancaire SEPA.
        </p>
        
        <BuyCryptoButton crypto={crypto} amount={amount} className="w-full" />
        
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500 leading-relaxed">
            Les services d'achat et de transfert de cryptomonnaies sont opérés par nos partenaires réglementés (Stripe, MoonPay, Relay). 
            Remedly est une interface logicielle non-hébergée (non-custodial) et ne détient à aucun moment vos fonds ou vos clés privées.
          </p>
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
        <Suspense fallback={<div className="text-center mt-20 text-gray-400">Chargement...</div>}>
          <AcheterContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
