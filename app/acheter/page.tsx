'use client';

import { useAuth } from '@/hooks/useAuth';
import { BuyWidget } from '@/components/BuyWidget';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AcheterContent() {
  const { authenticated, login } = useAuth();
  const searchParams = useSearchParams();
  const crypto = searchParams.get('crypto') || 'eth';

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
          Connectez-vous pour acheter
        </h2>
        <p className="text-lg text-gray-300 mb-8 max-w-md leading-relaxed">
          Un wallet sécurisé sera créé automatiquement pour vous. Vous pourrez ensuite procéder à l'achat en toute simplicité.
        </p>
        <button
          onClick={login}
          className="bg-indigo-600 text-white font-medium px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200"
        >
          Créer mon compte gratuitement
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto py-10 px-4 sm:px-0">
      <Link href="/portefeuille" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-6 transition-colors">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour au portefeuille
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-white mb-6">
        Acheter de la crypto
      </h1>
      <BuyWidget crypto={crypto} />
    </div>
  );
}

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default function AcheterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <Navbar />

      <div className="flex-1">
        <Suspense fallback={<div className="text-center mt-20 text-gray-400">Chargement...</div>}>
          <AcheterContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
