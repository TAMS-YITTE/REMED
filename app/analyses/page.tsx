'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthButton } from '@/components/AuthButton';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { FearAndGreedGauge } from '@/components/FearAndGreedGauge';
import { cryptoList } from '@/lib/cryptoList';
import { getFiscalReport } from '@/app/actions/fiscal';
import { getCryptoPrices } from '@/app/actions/prices';
import { getPortfolioSnapshots, type PortfolioSnapshot } from '@/app/actions/snapshots';
import { PortfolioHistoryChart } from '@/components/PortfolioHistoryChart';
import { getWalletData, getErc20Balances } from '@/app/actions/wallet';
import { getSolanaWalletData } from '@/app/actions/solana';
import { getBitcoinWalletData } from '@/app/actions/bitcoin';
import type { FiscalReport } from '@/lib/fiscal';
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Sparkles, Loader2, TrendingUp, ShieldCheck, BarChart2, Calendar } from 'lucide-react';

const SUPPORTED = cryptoList.filter((c) => c.supported);
const nameOf = (sym: string) => SUPPORTED.find((c) => c.id === sym.toLowerCase())?.name || sym.toUpperCase();

async function gatherOnChainQuantities(
  ethAddr?: string,
  solAddr?: string,
  btcAddr?: string
): Promise<Record<string, number>> {
  const q: Record<string, number> = {};
  try {
    if (ethAddr) {
      const [eth, erc20] = await Promise.all([getWalletData(ethAddr), getErc20Balances(ethAddr)]);
      if (eth?.balanceEth) q.eth = Number(eth.balanceEth);
      for (const [sym, val] of Object.entries(erc20 || {})) {
        q[sym.toLowerCase()] = Number(val);
      }
    }
    if (solAddr) {
      const sol = await getSolanaWalletData(solAddr);
      if (sol?.balanceSol) q.sol = Number(sol.balanceSol);
    }
    if (btcAddr) {
      const btc = await getBitcoinWalletData(btcAddr);
      if (btc?.balanceBtc) q.btc = Number(btc.balanceBtc);
    }
  } catch (e) {
    console.error('Analyses : échec récupération soldes on-chain', e);
  }
  return q;
}

export default function AnalysesPage() {
  const { isReady, authenticated, user, walletAddress, solanaWalletAddress, bitcoinWalletAddress } = useAuth();
  const { loading: subLoading, isPro } = useSubscription();
  // Montants affichés dans la devise choisie (EUR par défaut, USD via le taux live).
  const { formatAmount: eur } = useLanguage();
  const [report, setReport] = useState<FiscalReport | null>(null);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartAsset, setChartAsset] = useState('btc');

  useEffect(() => {
    if (!isPro || !user?.id) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      const quantities = await gatherOnChainQuantities(walletAddress, solanaWalletAddress, bitcoinWalletAddress);
      const [r, sn] = await Promise.all([
        getFiscalReport(user.id, quantities),
        getPortfolioSnapshots(user.id)
      ]);

      if (!cancelled) {
        setReport(r);
        setSnapshots(sn);
        if (r.hasData && r.assets[0]) setChartAsset(r.assets[0].symbol);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isPro, user?.id, walletAddress, solanaWalletAddress, bitcoinWalletAddress]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#252844]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#252844] text-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Analyses avancées</h1>
          <p className="text-gray-400 mb-6 max-w-md">Connectez-vous pour accéder à vos analyses d'investisseur.</p>
          <AuthButton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!subLoading && !isPro) {
    return (
      <div className="min-h-screen flex flex-col bg-[#252844] text-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Remedly Pro
          </div>
          <h1 className="text-2xl font-semibold mb-2">Analyses avancées réservées aux abonnés Pro</h1>
          <p className="text-gray-400 mb-6 max-w-md">Accédez au Fear & Greed Index, aux graphiques d'analyse et au suivi de plus-values réelles.</p>
          <Link
            href="/pro"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            Passer à Remedly Pro — 4,99 € / mois
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const chartOptions = report?.hasData ? report.assets.map((a) => a.symbol) : SUPPORTED.map((c) => c.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold">Tableau de Bord & Analyses Pro</h1>
              <p className="text-sm text-gray-400">Outils d'aide à la décision et indicateurs de marché en direct.</p>
            </div>
          </div>
          <span className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Remedly Pro Active
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* FEAR AND GREED INDEX GAUGE */}
            <FearAndGreedGauge />

            {/* SYNTHÈSE DE VALEUR DU PORTEFEUILLE */}
            {report?.hasData && (
              <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Performance Globale de votre Portefeuille
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#21243b] p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400">Total Investi / Revient</p>
                    <p className="text-xl font-bold text-white">{eur(report.totalInvested)}</p>
                  </div>
                  <div className="bg-[#21243b] p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400">Valeur Actuelle Totale</p>
                    <p className="text-xl font-bold text-indigo-300">
                      {report.totalCurrentValue != null ? eur(report.totalCurrentValue) : '—'}
                    </p>
                  </div>
                  <div className="bg-[#21243b] p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-400">Plus-Value Latente globale</p>
                    <p
                      className={`text-xl font-bold ${
                        report.totalLatentPL == null ? '' : report.totalLatentPL >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {report.totalLatentPL != null
                        ? `${report.totalLatentPL >= 0 ? '+' : ''}${eur(report.totalLatentPL)}`
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* DÉTAIL DES REVENUS / ACTIFS */}
                <div className="space-y-2">
                  {report.assets.map((a) => (
                    <div key={a.symbol} className="flex items-center justify-between bg-[#21243b] p-3.5 rounded-xl border border-white/5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase text-white">{a.symbol}</span>
                        <span className="text-xs text-gray-400">({a.totalQuantity} détenus)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-300">{a.currentValue != null ? eur(a.currentValue) : '—'}</span>
                        {a.latentPLPercent != null && (
                          <span className={`font-bold ${a.latentPL! >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {a.latentPL! >= 0 ? '+' : ''}{(a.latentPLPercent * 100).toFixed(1)} %
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HISTORIQUE ET COURBE TEMPORELLE DU PORTEFEUILLE */}
            <PortfolioHistoryChart snapshots={snapshots} />

            {/* GRAPHIQUE INTERACTIF */}
            <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-white text-lg">Graphique & Analyse de Cours</h3>
                  <p className="text-xs text-gray-400">Visualisez les tendances à 1 mois, 6 mois et 1 an.</p>
                </div>
                <div className="w-full sm:w-64">
                  <select
                    value={chartAsset}
                    onChange={(e) => setChartAsset(e.target.value)}
                    className="w-full bg-[#1a1c2e] border border-white/15 text-white rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {chartOptions.map((sym) => (
                      <option key={sym} value={sym}>{nameOf(sym)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <AnalyticsChart cryptoId={chartAsset} cryptoName={nameOf(chartAsset)} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
