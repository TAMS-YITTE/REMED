'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthButton } from '@/components/AuthButton';
import { getFiscalReport } from '@/app/actions/fiscal';
import { getCryptoPrices } from '@/app/actions/prices';
import type { FiscalReport } from '@/lib/fiscal';
import { computeFiscalReport, type PurchaseRow } from '@/lib/fiscal';
import { parseTransactionCsv, type CsvTransaction } from '@/lib/csvParser';
import { getWalletData, getErc20Balances } from '@/app/actions/wallet';
import { getSolanaWalletData } from '@/app/actions/solana';
import { getBitcoinWalletData } from '@/app/actions/bitcoin';
import { Loader2, Printer, Sparkles, AlertTriangle, ArrowDownRight, ArrowUpRight, Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

const eur = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const qty = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 8 });
const date = (s: string) => new Date(s).toLocaleDateString('fr-FR');

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
    console.error('Rapport fiscal : échec récupération soldes on-chain', e);
  }
  return q;
}

export default function RapportFiscalPage() {
  const { isReady, authenticated, user, walletAddress, solanaWalletAddress, bitcoinWalletAddress } = useAuth();
  const { loading: subLoading, isPro } = useSubscription();
  const [report, setReport] = useState<FiscalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [csvImports, setCsvImports] = useState<CsvTransaction[]>([]);
  const [csvStatus, setCsvStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReport = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [quantities, prices] = await Promise.all([
        gatherOnChainQuantities(walletAddress, solanaWalletAddress, bitcoinWalletAddress),
        getCryptoPrices()
      ]);

      const baseReport = await getFiscalReport(user.id, quantities);

      if (csvImports.length > 0) {
        const extraPurchases: PurchaseRow[] = csvImports.map(c => ({
          provider: c.provider,
          fiat_amount: c.fiatAmount,
          crypto_amount: c.quantity,
          crypto_currency: c.symbol,
          created_at: c.date
        }));
        
        const mergedReport = computeFiscalReport(extraPurchases, prices || null, quantities);
        setReport(mergedReport);
      } else {
        setReport(baseReport);
      }
    } catch (e) {
      console.error("Erreur lors de la génération du rapport :", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPro || !user?.id) return;
    loadReport();
  }, [isPro, user?.id, walletAddress, solanaWalletAddress, bitcoinWalletAddress, csvImports.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const result = parseTransactionCsv(text);
        if (result.transactions.length > 0) {
          setCsvImports(prev => [...prev, ...result.transactions]);
          setCsvStatus(`✅ ${result.transactions.length} transaction(s) importée(s) avec succès !${result.warnings.length > 0 ? ` (${result.warnings.length} avertissement(s))` : ''}`);
        } else {
          setCsvStatus(`⚠️ ${result.warnings.join(' | ') || "Aucun format de transaction reconnu dans le fichier CSV."}`);
        }
      }
    };
    reader.readAsText(file);
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
      <div className="min-h-screen flex flex-col bg-[#252844] text-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">Relevé fiscal</h1>
          <p className="text-gray-400 mb-6 max-w-md">Connectez-vous pour accéder à votre relevé fiscal.</p>
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
          <h1 className="text-2xl font-semibold mb-2">Relevé fiscal réservé aux abonnés Pro</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            Suivez vos prix de revient, votre plus-value latente et préparez votre déclaration.
          </p>
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

  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 print:py-4">
        {/* EN-TÊTE IMPRESSION / ÉCRAN */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10 print:border-gray-300">
          <div>
            <div className="hidden print:block text-2xl font-bold text-gray-900 mb-1">
              rem<span className="text-indigo-600">e</span>dly — Relevé Fiscal Officiel
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white print:text-gray-900">
              Relevé Fiscal & Bilan Patrimonial
            </h1>
            {report?.generatedAt && (
              <p className="text-sm text-gray-400 print:text-gray-600 mt-1">
                Généré le {date(report.generatedAt)} • SARL YITTE (Remedly Pro)
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-[#2d3152] hover:bg-[#363b63] border border-white/15 text-sm font-medium py-2.5 px-4 rounded-xl transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-400" /> Importer un CSV (Binance/Kraken)
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              <Printer className="w-4 h-4" /> Imprimer / Export PDF
            </button>
          </div>
        </div>

        {csvStatus && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm flex items-center justify-between print:hidden">
            <span>{csvStatus}</span>
            <button onClick={() => setCsvStatus('')} className="text-xs underline text-indigo-400">Masquer</button>
          </div>
        )}

        {(loading || subLoading) && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
            <p className="text-sm text-gray-400">Calcul du bilan patrimonial et des cours en direct...</p>
          </div>
        )}

        {!loading && report && (
          <>
            {/* CARDS DE SYNTHÈSE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#2d3152] print:bg-gray-100 border border-white/10 print:border-gray-300 rounded-2xl p-5">
                <p className="text-xs text-gray-400 print:text-gray-600 uppercase font-semibold mb-1">Total Investi</p>
                <p className="text-2xl font-bold text-white print:text-gray-900">{eur(report.totalInvested)}</p>
                <p className="text-[11px] text-gray-400 mt-1">Prix de revient cumulé</p>
              </div>
              <div className="bg-[#2d3152] print:bg-gray-100 border border-white/10 print:border-gray-300 rounded-2xl p-5">
                <p className="text-xs text-gray-400 print:text-gray-600 uppercase font-semibold mb-1">Valeur Actuelle</p>
                <p className="text-2xl font-bold text-indigo-300 print:text-indigo-700">
                  {report.totalCurrentValue != null ? eur(report.totalCurrentValue) : '—'}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Valeur marché en direct</p>
              </div>
              <div className="bg-[#2d3152] print:bg-gray-100 border border-white/10 print:border-gray-300 rounded-2xl p-5">
                <p className="text-xs text-gray-400 print:text-gray-600 uppercase font-semibold mb-1">Plus-Value Latente</p>
                <p
                  className={`text-2xl font-bold ${
                    report.totalLatentPL == null ? '' : report.totalLatentPL >= 0 ? 'text-emerald-400 print:text-emerald-700' : 'text-red-400 print:text-red-700'
                  }`}
                >
                  {report.totalLatentPL != null
                    ? `${report.totalLatentPL >= 0 ? '+' : ''}${eur(report.totalLatentPL)}`
                    : '—'}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">Gain / Perte non réalisé</p>
              </div>
            </div>

            {/* DÉTAIL PAR ACTIF */}
            <div className="space-y-6 mb-10">
              <h2 className="text-lg font-bold text-white print:text-gray-900">Détail des Actifs Détenus & Plus-Values</h2>
              {report.assets.map((a) => (
                <div key={a.symbol} className="bg-[#2d3152] print:bg-white border border-white/10 print:border-gray-300 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 print:border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xl uppercase tracking-wider text-white print:text-gray-900">{a.symbol}</span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 print:bg-gray-200 print:text-gray-800">
                        {qty(a.totalQuantity)} {a.symbol.toUpperCase()}
                      </span>
                    </div>
                    {a.latentPLPercent != null && (
                      <span
                        className={`text-sm font-bold px-3 py-1 rounded-lg ${
                          a.latentPL! >= 0 ? 'bg-emerald-500/20 text-emerald-300 print:text-emerald-800' : 'bg-red-500/20 text-red-300 print:text-red-800'
                        }`}
                      >
                        {a.latentPL! >= 0 ? '+' : ''}
                        {(a.latentPLPercent * 100).toFixed(2)} %
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-xs text-gray-400 print:text-gray-600">Quantité Détenue</p>
                      <p className="font-semibold text-white print:text-gray-900">{qty(a.totalQuantity)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 print:text-gray-600">Montant Investi</p>
                      <p className="font-semibold text-white print:text-gray-900">
                        {a.costInconnu ? (
                          <span className="text-xs text-amber-300 font-normal bg-amber-500/20 px-2 py-0.5 rounded print:bg-gray-200 print:text-gray-800">
                            Inconnu (Dépôt)
                          </span>
                        ) : (
                          eur(a.totalInvested)
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 print:text-gray-600">PRU (Prix de Revient)</p>
                      <p className="font-semibold text-white print:text-gray-900">
                        {a.costInconnu || !a.avgUnitCost ? '—' : eur(a.avgUnitCost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 print:text-gray-600">Valeur Actuelle</p>
                      <p className="font-semibold text-indigo-300 print:text-indigo-700">{a.currentValue != null ? eur(a.currentValue) : '—'}</p>
                    </div>
                  </div>

                  {/* LOTS D'ACQUISITION */}
                  {a.lots.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5 print:border-gray-200">
                      <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">Historique d'acquisitions ({a.lots.length})</p>
                      <table className="w-full text-xs print:text-black">
                        <thead className="text-gray-400 print:text-gray-700">
                          <tr className="text-left border-b border-white/10 print:border-gray-300">
                            <th className="py-1.5 font-medium">Date</th>
                            <th className="py-1.5 font-medium">Source / Échange</th>
                            <th className="py-1.5 font-medium text-right">Montant Fiat</th>
                            <th className="py-1.5 font-medium text-right">Quantité</th>
                            <th className="py-1.5 font-medium text-right">Prix Unitaire</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.lots.map((lot, i) => (
                            <tr key={i} className="border-t border-white/5 print:border-gray-200">
                              <td className="py-1.5">{date(lot.date)}</td>
                              <td className="py-1.5 capitalize">{lot.provider}</td>
                              <td className="py-1.5 text-right font-medium">{eur(lot.fiatAmount)}</td>
                              <td className="py-1.5 text-right font-mono">{qty(lot.cryptoAmount)}</td>
                              <td className="py-1.5 text-right font-medium">{eur(lot.unitPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* DISCLAIMER & PÉRIMÈTRE FISCAL */}
        <div className="mt-10 border-t border-white/10 print:border-gray-300 pt-6 space-y-3 text-xs text-gray-400 print:text-gray-600">
          <p className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong className="text-gray-300 print:text-gray-800">Avertissement Légal :</strong> Ce document récapitule vos acquisitions et soldes réels on-chain. Il constitue un relevé justificatif d'actifs et de plus-values latentes non réalisées.
            </span>
          </p>
          <p>
            Remedly agit en qualité d'éditeur de logiciel d'aide à la décision. Le présent relevé est édité pour le compte de l'abonné Remedly Pro.
          </p>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
