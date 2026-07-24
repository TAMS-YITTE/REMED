'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthButton } from '@/components/AuthButton';
import { getFiscalReport } from '@/app/actions/fiscal';
import type { FiscalReport } from '@/lib/fiscal';
import { getWalletData, getErc20Balances } from '@/app/actions/wallet';
import { getSolanaWalletData } from '@/app/actions/solana';
import { getBitcoinWalletData } from '@/app/actions/bitcoin';
import { Loader2, Printer, Sparkles, AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const eur = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const qty = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 8 });
const date = (s: string) => new Date(s).toLocaleDateString('fr-FR');

// Rassemble, au mieux, les quantités réellement détenues on-chain par symbole,
// pour la détection des fonds externes. Best-effort : un échec sur une chaîne
// n'empêche pas le reste du rapport.
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

  useEffect(() => {
    if (!isPro || !user?.id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const quantities = await gatherOnChainQuantities(walletAddress, solanaWalletAddress, bitcoinWalletAddress);
      const r = await getFiscalReport(user.id, quantities);
      if (!cancelled) {
        setReport(r);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPro, user?.id, walletAddress, solanaWalletAddress, bitcoinWalletAddress]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#252844]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Non connecté
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

  // Connecté mais pas abonné → mur d'upgrade
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
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 print:py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Relevé fiscal</h1>
            {report?.generatedAt && (
              <p className="text-sm text-gray-400">Généré le {date(report.generatedAt)}</p>
            )}
          </div>
          <button
            onClick={() => window.print()}
            className="print:hidden inline-flex items-center gap-2 bg-[#2d3152] hover:bg-[#363b63] border border-white/15 text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" /> Télécharger en PDF
          </button>
        </div>

        {(loading || subLoading) && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        )}

        {!loading && report && !report.hasData && (
          <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-300 font-medium mb-1">Aucun achat à déclarer pour l'instant.</p>
            <p className="text-sm text-gray-400">
              Votre relevé se remplira automatiquement dès votre premier achat sur Remedly.
            </p>
          </div>
        )}

        {!loading && report && report.hasData && (
          <>
            {/* Synthèse */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-[#2d3152] border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400">Total investi</p>
                <p className="text-lg font-bold">{eur(report.totalInvested)}</p>
              </div>
              <div className="bg-[#2d3152] border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400">Valeur actuelle</p>
                <p className="text-lg font-bold">
                  {report.totalCurrentValue != null ? eur(report.totalCurrentValue) : '—'}
                </p>
              </div>
              <div className="bg-[#2d3152] border border-white/10 rounded-xl p-4">
                <p className="text-xs text-gray-400">Plus-value latente</p>
                <p
                  className={`text-lg font-bold ${
                    report.totalLatentPL == null ? '' : report.totalLatentPL >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {report.totalLatentPL != null
                    ? `${report.totalLatentPL >= 0 ? '+' : ''}${eur(report.totalLatentPL)}`
                    : '—'}
                </p>
              </div>
            </div>

            {/* Détail par actif */}
            <div className="space-y-4">
              {report.assets.map((a) => (
                <div key={a.symbol} className="bg-[#2d3152] border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold uppercase">{a.symbol}</span>
                    {a.latentPLPercent != null && (
                      <span
                        className={`text-sm font-semibold ${a.latentPL! >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        {a.latentPL! >= 0 ? '+' : ''}
                        {(a.latentPLPercent * 100).toFixed(1)} %
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-xs text-gray-400">Quantité</p>
                      <p className="font-medium">{qty(a.totalQuantity)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Investi</p>
                      <p className="font-medium">{eur(a.totalInvested)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Prix de revient moyen</p>
                      <p className="font-medium">{eur(a.avgUnitCost)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Valeur actuelle</p>
                      <p className="font-medium">{a.currentValue != null ? eur(a.currentValue) : '—'}</p>
                    </div>
                  </div>

                  {a.externalFundsWarning && (
                    <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg p-2.5 text-xs mb-3">
                      {a.externalFundsWarning === 'deposit' ? (
                        <>
                          <ArrowDownRight className="w-4 h-4 shrink-0" />
                          <span>
                            Votre solde on-chain est supérieur à vos achats Remedly : des fonds provenant d'une
                            source externe sont présents. Leur prix d'acquisition n'est pas connu de Remedly et
                            n'est pas inclus dans ces chiffres.
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-4 h-4 shrink-0" />
                          <span>
                            Votre solde on-chain est inférieur à vos achats Remedly : une partie a quitté le
                            portefeuille (envoi/dépense). La crypto étant fongible, Remedly ne peut pas déterminer
                            le prix de revient de ce qui est sorti.
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Lignes d'acquisition */}
                  <details className="text-sm">
                    <summary className="cursor-pointer text-indigo-300 print:hidden">
                      {a.lots.length} acquisition{a.lots.length > 1 ? 's' : ''}
                    </summary>
                    <table className="w-full mt-3 text-xs">
                      <thead className="text-gray-400">
                        <tr className="text-left">
                          <th className="py-1 font-normal">Date</th>
                          <th className="py-1 font-normal">Source</th>
                          <th className="py-1 font-normal text-right">Montant</th>
                          <th className="py-1 font-normal text-right">Quantité</th>
                          <th className="py-1 font-normal text-right">PU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.lots.map((lot, i) => (
                          <tr key={i} className="border-t border-white/5">
                            <td className="py-1">{date(lot.date)}</td>
                            <td className="py-1 capitalize">{lot.provider}</td>
                            <td className="py-1 text-right">{eur(lot.fiatAmount)}</td>
                            <td className="py-1 text-right">{qty(lot.cryptoAmount)}</td>
                            <td className="py-1 text-right">{eur(lot.unitPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                </div>
              ))}
            </div>

            {!report.pricesAvailable && (
              <p className="text-xs text-amber-300/80 mt-4">
                Les prix de marché sont momentanément indisponibles : la valeur actuelle et la plus-value latente
                ne sont pas affichées. Les montants investis restent exacts.
              </p>
            )}
          </>
        )}

        {/* Disclaimer + périmètre — toujours affiché */}
        {!loading && (
          <div className="mt-8 border-t border-white/10 pt-5 space-y-3 text-xs text-gray-400">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong className="text-gray-300">Ce document ne remplace pas un conseil fiscal professionnel.</strong>{' '}
                Il récapitule vos <strong className="text-gray-300">acquisitions</strong> réalisées sur Remedly et
                votre plus-value <strong className="text-gray-300">latente</strong> (non réalisée).
              </span>
            </p>
            <p>
              Il ne calcule <strong className="text-gray-300">pas</strong> de plus-value réalisée (formulaire 2086) :
              Remedly ne réalise aucune vente, il n'existe donc aucune cession dans vos données. Le calcul des
              plus-values imposables nécessitera l'import de vos ventes réalisées ailleurs (à venir).
            </p>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
