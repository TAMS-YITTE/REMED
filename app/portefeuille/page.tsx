'use client';

import { useAuth } from '@/hooks/useAuth';
import { WalletBalance } from '@/components/WalletBalance';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthButton } from '@/components/AuthButton';
import { Footer } from '@/components/Footer';

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
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            Votre Portefeuille
          </h1>
          <p className="text-gray-500">
            Gérez vos cryptomonnaies en toute sécurité.
          </p>
          <p className="text-[13px] text-gray-400 mt-2 bg-gray-100 p-3 rounded-lg border border-gray-200">
            🔒 <strong>100% Non-Custodial :</strong> Ce portefeuille a été généré automatiquement par <strong>Privy</strong> lors de votre connexion. Vous seul y avez accès. Remedly ne détient pas vos fonds.
          </p>
        </motion.div>

        {walletAddress ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="mb-8">
            <WalletBalance walletAddress={walletAddress} />
          </motion.div>
        ) : (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm mb-8">
            Génération de votre portefeuille en cours...
          </div>
        )}

        {/* CTA Acheter */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
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
        </motion.div>
          {/* HISTORIQUE FICTIF */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernières transactions</h3>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center justify-center py-10">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-gray-400">💸</span>
                  </div>
                  <p className="text-sm text-gray-500">Aucune transaction pour le moment.</p>
                  <p className="text-[13px] text-gray-400 mt-1">Votre historique s'affichera ici après votre premier achat.</p>
                </div>
              </div>
            </div>
          </div>

      </main>
      <Footer />
    </div>
  );
}
