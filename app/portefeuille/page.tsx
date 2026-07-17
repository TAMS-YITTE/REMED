'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getWalletData, getErc20Balances } from '@/app/actions/wallet';
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
  const [erc20Balances, setErc20Balances] = useState<Record<string, string>>({});
  
  const [isLoadingEth, setIsLoadingEth] = useState(false);
  const [isLoadingSol, setIsLoadingSol] = useState(false);
  const [isLoadingBtc, setIsLoadingBtc] = useState(false);
  const [isLoadingErc20, setIsLoadingErc20] = useState(false);

  const [prices, setPrices] = useState<CryptoPrices | null | undefined>(undefined);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  useEffect(() => {
    getCryptoPrices().then(p => setPrices(p));
  }, []);

  useEffect(() => {
    if (walletAddress) {
      setIsLoadingEth(true);
      setIsLoadingErc20(true);
      getWalletData(walletAddress).then(data => {
        setEthData(data);
        setIsLoadingEth(false);
      });
      getErc20Balances(walletAddress).then(data => {
        setErc20Balances(data);
        setIsLoadingErc20(false);
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

  const handleExportCSV = () => {
    if (!prices) return;

    const rows = [
      ['Actif', 'Solde', 'Prix unitaire (EUR)', 'Valeur totale (EUR)', 'Horodatage']
    ];

    const timestamp = new Date().toLocaleString('fr-FR');
    
    const addRow = (ticker: string, balanceStr: string | undefined | null, priceKey: string) => {
      if (!balanceStr) return;
      const balance = parseFloat(balanceStr);
      if (balance > 0 && prices[priceKey] !== undefined) {
        const price = prices[priceKey];
        const value = balance * price;
        rows.push([
          ticker, 
          balance.toString(), 
          price.toString(), 
          value.toFixed(2), 
          timestamp
        ]);
      }
    };

    addRow('ETH', ethData?.balanceEth, 'eth');
    addRow('SOL', solData?.balanceSol, 'sol');
    addRow('BTC', btcData?.balanceBtc, 'btc');

    Object.entries(erc20Balances).forEach(([sym, bal]) => {
      const priceKey = sym.toLowerCase();
      addRow(sym, bal, priceKey);
    });

    if (rows.length === 1) {
      alert("Aucun actif à exporter.");
      return;
    }

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `remedly-releve-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          Vous devez être connecté pour accéder à votre portefeuille.
        </p>
        <AuthButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#252844] text-white">
      {/* NAVIGATION */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 border-b border-white/10 sticky top-0 bg-[#252844]/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tighter text-white no-underline">
            rem<span className="text-indigo-400">e</span>dly
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Accueil</Link>
            <Link href="/apprendre" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Apprendre</Link>
            <Link href="/acheter" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Acheter</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AuthButton />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
            Votre Portefeuille
          </h1>
          <p className="text-gray-400">
            Gérez vos cryptomonnaies en toute sécurité.
          </p>
          <p className="text-[13px] text-gray-300 mt-2 bg-[#2E3152] p-3 rounded-lg border border-white/10">
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
              erc20Balances={erc20Balances}
              prices={prices}
              isLoading={isLoadingEth} 
              isLoadingSolana={isLoadingSol}
              isLoadingBitcoin={isLoadingBtc}
              isLoadingErc20={isLoadingErc20}
            />
          </motion.div>
        ) : (
          <div className="bg-yellow-900/30 text-yellow-400 p-4 rounded-xl text-sm mb-8">
            Génération de votre portefeuille en cours...
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="mb-10">
          <PortfolioDonut ethValue={ethValue} solValue={solValue} btcValue={btcValue} />
        </motion.div>

        {/* CSV EXPORT */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }} className="mb-10 bg-[#2E3152] border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Déclaration Fiscale</h3>
              <p className="text-xs text-gray-400 max-w-lg">
                Relevé indicatif de la valeur de vos actifs à la date du jour — ne remplace pas un conseil fiscal professionnel.
              </p>
            </div>
            <button 
              onClick={handleExportCSV}
              className="shrink-0 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Télécharger mon relevé (CSV)
            </button>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-[#2E3152] border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">🚀</div>
            <h3 className="text-lg font-semibold text-white mb-2">Acheter</h3>
            <p className="text-gray-400 text-sm mb-4">Investissez par carte bancaire ou virement.</p>
            <Link href="/acheter" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 w-full transition-opacity">Acheter des cryptos</Link>
          </div>
          <div className="bg-[#2E3152] border border-white/10 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-[#252844] rounded-full flex items-center justify-center mx-auto mb-4 text-xl">💸</div>
            <h3 className="text-lg font-semibold text-white mb-2">Envoyer</h3>
            <p className="text-gray-400 text-sm mb-4">Envoyez des cryptos vers une autre adresse.</p>
            <button onClick={() => setIsSendModalOpen(true)} className="inline-block bg-[#252844] text-white border border-white/10 px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#353866] w-full transition-colors">Envoyer des cryptos</button>
          </div>
        </motion.div>
          {/* HISTORIQUE */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-white mb-4">Dernières transactions</h3>
            <div className="bg-[#2E3152] border border-white/10 rounded-2xl overflow-hidden">
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
