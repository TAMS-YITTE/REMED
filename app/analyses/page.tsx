'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthButton } from '@/components/AuthButton';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { cryptoList } from '@/lib/cryptoList';
import { getFiscalReport } from '@/app/actions/fiscal';
import type { FiscalReport } from '@/lib/fiscal';
import { LineChart, Sparkles, Loader2 } from 'lucide-react';

const SUPPORTED = cryptoList.filter((c) => c.supported);
const nameOf = (sym: string) => SUPPORTED.find((c) => c.id === sym.toLowerCase())?.name || sym.toUpperCase();
const eur = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

export default function AnalysesPage() {
  const { isReady, authenticated, user } = useAuth();
  const { loading: subLoading, isPro } = useSubscription();
  const [report, setReport] = useState<FiscalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartAsset, setChartAsset] = useState('btc');

  useEffect(() => {
    if (!isPro || !user?.id) return;
    let cancelled = false;
    setLoading(true);
    getFiscalReport(user.id).then((r) => {
      if (cancelled) return;
      setReport(r);
      if (r.hasData && r.assets[0]) setChartAsset(r.assets[0].symbol);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [isPro, user?.id]);

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
          <p className="text-gray-400 mb-6 max-w-md">Connectez-vous pour accéder à vos analyses.</p>
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
          <p className="text-gray-400 mb-6 max-w-md">Graphiques 1 mois / 6 mois / 1 an et suivi de votre plus-value latente.</p>
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
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="flex items-center gap-2 mb-6">
          <LineChart className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold">Analyses avancées</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : (
          <>
            {/* Synthèse P&L (basée sur les achats Remedly) */}
            {report?.hasData ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-[#2d3152] border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-400">Total investi</p>
                  <p className="text-lg font-bold">{eur(report.totalInvested)}</p>
                </div>
                <div className="bg-[#2d3152] border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-400">Valeur actuelle</p>
                  <p className="text-lg font-bold">{report.totalCurrentValue != null ? eur(report.totalCurrentValue) : '—'}</p>
                </div>
                <div className="bg-[#2d3152] border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-400">Plus-value latente</p>
                  <p className={`text-lg font-bold ${report.totalLatentPL == null ? '' : report.totalLatentPL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {report.totalLatentPL != null ? `${report.totalLatentPL >= 0 ? '+' : ''}${eur(report.totalLatentPL)}` : '—'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 bg-[#2d3152] border border-white/10 rounded-xl p-4 mb-6">
                Votre plus-value latente s'affichera ici dès votre premier achat sur Remedly. En attendant, explorez les cours ci-dessous.
              </p>
            )}

            {/* Positions par actif */}
            {report?.hasData && (
              <div className="space-y-2 mb-8">
                {report.assets.map((a) => (
                  <div key={a.symbol} className="flex items-center justify-between bg-[#2d3152] border border-white/10 rounded-xl p-4 text-sm">
                    <span className="font-semibold uppercase">{a.symbol}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">{a.currentValue != null ? eur(a.currentValue) : '—'}</span>
                      {a.latentPLPercent != null && (
                        <span className={`font-semibold ${a.latentPL! >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {a.latentPL! >= 0 ? '+' : ''}{(a.latentPLPercent * 100).toFixed(1)} %
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Graphique de cours 1M / 6M / 1A */}
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Actif à visualiser</label>
              <select
                value={chartAsset}
                onChange={(e) => setChartAsset(e.target.value)}
                className="w-full sm:w-64 bg-[#1a1c2e] border border-white/15 text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {chartOptions.map((sym) => (
                  <option key={sym} value={sym}>{nameOf(sym)}</option>
                ))}
              </select>
            </div>

            <AnalyticsChart cryptoId={chartAsset} cryptoName={nameOf(chartAsset)} />

            <p className="text-[11px] text-gray-500 mt-4">
              Données de marché CoinGecko. Ceci n'est pas un conseil en investissement.
            </p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
