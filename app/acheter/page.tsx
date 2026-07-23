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

  return (
    <div className="w-full max-w-md mx-auto py-10 px-4 sm:px-0 text-center">
      <div className="flex justify-center mb-6">
        <Link href="/portefeuille" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au portefeuille
        </Link>
      </div>

      <div className="bg-[#2E3152] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          Acheter de la crypto
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Achetez des {crypto.toUpperCase()} de manière sécurisée en carte bancaire ou virement via notre partenaire Privy.
        </p>
        
        <BuyCryptoButton crypto={crypto} className="w-full" />
        
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
