'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getWalletData } from '@/app/actions/wallet';
import { getSolanaWalletData } from '@/app/actions/solana';
import { getBitcoinWalletData } from '@/app/actions/bitcoin';
import { getCryptoPrices } from '@/app/actions/prices';
import type { CryptoPrices } from '@/app/actions/prices';
import type { WalletData, Transaction } from '@/app/actions/utils';
import { WalletBalance } from '@/components/WalletBalance';
import { TransactionHistory } from '@/components/TransactionHistory';
import { PortfolioDonut } from '@/components/PortfolioDonut';
import { SendModal } from '@/components/SendModal';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthButton } from '@/components/AuthButton';
import { Footer } from '@/components/Footer';

export default function PortefeuillePage() {
  const { isReady, authenticated, walletAddress, solanaWalletAddress, bitcoinWalletAddress, createBitcoinWallet } = useAuth();
  
  const [ethData, setEthData] = useState<WalletData | null>(null);
  const [solData, setSolData] = useState<WalletData | null>(null);
  const [btcData, setBtcData] = useState<WalletData | null>(null);
  
  const [isLoadingEth, setIsLoadingEth] = useState(false);
  const [isLoadingSol, setIsLoadingSol] = useState(false);
  const [isLoadingBtc, setIsLoadingBtc] = useState(false);

  const [prices, setPrices] = useState<CryptoPrices | null | undefined>(undefined);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  useEffect(() => {
    getCryptoPrices().then(p => setPrices(p));
  }, []);

  useEffect(() => {
    if (walletAddress) {
      setIsLoadingEth(true);
      getWalletData(walletAddress).then(data => {
        setEthData(data);
        setIsLoadingEth(false);
      });
    }
  }, [walletAddress]);

  useEffect(() => {
    if (solanaWalletAddress) {
      setIsLoadingSol(true);
      getSolanaWalletData(solanaWalletAddress).then(data => {
        setSolData(data);
        setIsLoadingSol(false);
      });
    }
  }, [solanaWalletAddress]);

  useEffect(() => {
    if (bitcoinWalletAddress) {
      setIsLoadingBtc(true);
      getBitcoinWalletData(bitcoinWalletAddress).then(data => {
        setBtcData(data);
        setIsLoadingBtc(false);
      });
    }
  }, [bitcoinWalletAddress]);

  const ethValue = (prices && ethData?.balanceEth) ? parseFloat(ethData.balanceEth) * prices.eth : 0;
  const solValue = (prices && solData?.balanceSol) ? parseFloat(solData.balanceSol) * prices.sol : 0;
  const btcValue = (prices && btcData?.balanceBtc) ? parseFloat(btcData.balanceBtc) * prices.btc : 0;

  const allTransactions: Transaction[] = [
    ...(ethData?.transactions || []),
    ...(solData?.transactions || []),
    ...(btcData?.transactions || [])
  ].sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp));

  const isLoadingHistory = isLoadingEth || isLoadingSol || isLoadingBtc;

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
            <WalletBalance 
              walletAddress={walletAddress} 
              solanaWalletAddress={solanaWalletAddress} 
              bitcoinWalletAddress={bitcoinWalletAddress} 
              onCreateBitcoinWallet={createBitcoinWallet} 
              balance={ethData?.balanceEth} 
              solanaBalance={solData?.balanceSol}
              bitcoinBalance={btcData?.balanceBtc}
              prices={prices}
              isLoading={isLoadingEth} 
              isLoadingSolana={isLoadingSol}
              isLoadingBitcoin={isLoadingBtc}
            />
          </motion.div>
        ) : (
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl text-sm mb-8">
            Génération de votre portefeuille en cours...
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="mb-10">
          <PortfolioDonut ethValue={ethValue} solValue={solValue} btcValue={btcValue} />
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-4 text-xl">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acheter</h3>
            <p className="text-gray-500 text-sm mb-4">Investissez par carte bancaire ou virement.</p>
            <Link href="/acheter" className="inline-block bg-[#534AB7] text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 w-full transition-opacity">Acheter des cryptos</Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">💸</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Envoyer</h3>
            <p className="text-gray-500 text-sm mb-4">Envoyez des cryptos vers une autre adresse.</p>
            <button onClick={() => setIsSendModalOpen(true)} className="inline-block bg-white text-gray-700 border border-gray-200 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 w-full transition-colors">Envoyer des cryptos</button>
          </div>
        </motion.div>
          {/* HISTORIQUE */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dernières transactions</h3>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <TransactionHistory 
                transactions={allTransactions} 
                isLoading={isLoadingHistory} 
                walletAddress={walletAddress} 
              />
            </div>
          </div>

        <SendModal 
          isOpen={isSendModalOpen} 
          onClose={() => setIsSendModalOpen(false)} 
          balances={{ eth: ethData?.balanceEth || '0', sol: solData?.balanceSol || '0' }} 
        />
      </main>
      <Footer />
    </div>
  );
}
