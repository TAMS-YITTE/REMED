'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthButton } from '@/components/AuthButton';
import { Check, Sparkles, Loader2, FileText, BellRing, LineChart, Settings } from 'lucide-react';

// Les 3 piliers de Remedly Pro. Honnêteté obligatoire (CLAUDE.md §2) : tant
// qu'ils ne sont pas construits, ils sont présentés comme "à venir", jamais
// comme déjà disponibles.
const FEATURES = [
  {
    icon: FileText,
    title: 'Aide à la déclaration fiscale',
    desc: "Suivi de vos achats, prix de revient et plus-value latente, export PDF. Ne remplace pas un conseil fiscal professionnel.",
    status: 'available' as const,
  },
  {
    icon: BellRing,
    title: 'Alertes de prix par email',
    desc: 'Définissez des seuils et soyez prévenu par email dès qu\'ils sont atteints.',
    status: 'available' as const,
  },
  {
    icon: LineChart,
    title: 'Analyses avancées',
    desc: 'Graphiques 1 mois / 6 mois / 1 an et suivi de votre plus-value latente.',
    status: 'available' as const,
  },
];

function ProPageContent() {
  const { isReady, authenticated, user } = useAuth();
  const { loading: subLoading, isPro, status } = useSubscription();
  const searchParams = useSearchParams();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState('');

  const canceled = searchParams.get('canceled') === '1';

  const handlePortal = async () => {
    setError('');
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privyId: user?.id }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        setError(data?.error || "Impossible d'ouvrir la gestion de l'abonnement.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Erreur réseau lors de l'ouverture de la gestion de l'abonnement.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setError('');
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privyId: user?.id, email: user?.email?.address }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        setError(data?.error || "Impossible de lancer l'abonnement.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Erreur réseau lors du lancement de l'abonnement.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#252844]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Remedly Pro
          </div>
          <h1 className="text-3xl font-bold mb-2">Passez à Remedly Pro</h1>
          <p className="text-gray-400">
            Les outils pour suivre, déclarer et piloter vos cryptos.{' '}
            <span className="text-4xl font-bold text-white block mt-4">
              4,99 € <span className="text-base font-normal text-gray-400">/ mois</span>
            </span>
          </p>
        </div>

        {canceled && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl p-3 text-sm mb-6 text-center">
            Paiement annulé. Vous pouvez réessayer quand vous voulez.
          </div>
        )}

        {isPro ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center mb-8">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold mb-1">Vous êtes Pro 🎉</h2>
            <p className="text-gray-400 text-sm">
              {status?.currentPeriodEnd
                ? `Abonnement actif jusqu'au ${new Date(status.currentPeriodEnd).toLocaleDateString('fr-FR')}${status.cancelAtPeriodEnd ? ' (résiliation programmée)' : ''}.`
                : 'Votre abonnement est actif.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <Link
                href="/rapport-fiscal"
                className="inline-flex items-center gap-2 bg-[#2d3152] hover:bg-[#363b63] border border-white/15 text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" /> Mon relevé fiscal
              </Link>
              <Link
                href="/alertes"
                className="inline-flex items-center gap-2 bg-[#2d3152] hover:bg-[#363b63] border border-white/15 text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <BellRing className="w-4 h-4" /> Mes alertes
              </Link>
              <Link
                href="/analyses"
                className="inline-flex items-center gap-2 bg-[#2d3152] hover:bg-[#363b63] border border-white/15 text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                <LineChart className="w-4 h-4" /> Mes analyses
              </Link>
              <button
                onClick={handlePortal}
                disabled={portalLoading}
                className="inline-flex items-center gap-2 bg-transparent hover:bg-white/5 border border-white/15 text-sm font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-70"
              >
                {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                Gérer mon abonnement
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-6 mb-8">
            <ul className="space-y-5">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 shrink-0 bg-indigo-500/15 text-indigo-300 rounded-lg flex items-center justify-center">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{f.title}</span>
                      {f.status === 'available' ? (
                        <span className="text-[10px] uppercase tracking-wide bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded">
                          Disponible
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wide bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">
                          Bientôt
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-[11px] text-gray-500 mt-5 border-t border-white/10 pt-4">
              Ces fonctionnalités sont en cours de déploiement. En vous abonnant maintenant,
              vous soutenez le développement et y accédez dès leur mise en ligne.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm mt-5">
                {error}
              </div>
            )}

            <div className="mt-6">
              {!authenticated ? (
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-3">Connectez-vous pour vous abonner.</p>
                  <AuthButton />
                </div>
              ) : subLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                </div>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={checkoutLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-70"
                >
                  {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  S'abonner pour 4,99 € / mois
                </button>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-500">
          Paiement sécurisé par Stripe. Résiliable à tout moment.
        </p>
      </main>
      <Footer />
    </div>
  );
}

export default function ProPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#252844]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      }
    >
      <ProPageContent />
    </Suspense>
  );
}
