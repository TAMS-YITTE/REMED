'use client';

import { useAuth } from '@/hooks/useAuth';
import { WalletBalance } from '@/components/WalletBalance';
import Link from 'next/link';
import { AuthButton } from '@/components/AuthButton';

export default function PortefeuillePage() {
  const { isReady, authenticated, walletAddress } = useAuth();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#534AB7]"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Accès restreint</h1>
        <p className="text-gray-500 mb-6 max-w-md">
          Vous devez être connecté pour accéder à votre portefeuille.
        </p>
        <AuthButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVIGATION */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 sticky top-0 z-10">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 no-underline">
          rem<span className="text-[#534AB7]">e</span>dly
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/portefeuille" className="text-sm font-medium text-[#534AB7]">
            Mon Portefeuille
          </Link>
          <AuthButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            Votre Portefeuille
          </h1>
          <p className="text-gray-500">
            Gérez vos cryptomonnaies en toute sécurité.
          </p>
        </div>

        {walletAddress ? (
          <div className="mb-8">
            <WalletBalance walletAddress={walletAddress} />
          </div>
        ) : (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm mb-8">
            Génération de votre portefeuille en cours...
          </div>
        )}

        {/* CTA Acheter */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">🚀</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Prêt à investir ?</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Achetez des cryptomonnaies par carte bancaire en quelques secondes et recevez-les directement sur ce portefeuille.
          </p>
          <Link 
            href="/acheter" 
            className="inline-block bg-[#534AB7] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Acheter des cryptos
          </Link>
        </div>
      </main>
    </div>
  );
}
