'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthButton } from '@/components/AuthButton';
import { cryptoList } from '@/lib/cryptoList';
import { getPriceAlerts, createPriceAlert, deletePriceAlert, type PriceAlert } from '@/app/actions/alerts';
import { BellRing, Sparkles, Loader2, Trash2, Plus } from 'lucide-react';

const SUPPORTED = cryptoList.filter((c) => c.supported);

const eur = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });

export default function AlertesPage() {
  const { isReady, authenticated, user } = useAuth();
  const { loading: subLoading, isPro } = useSubscription();

  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [crypto, setCrypto] = useState('btc');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [target, setTarget] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const email = user?.email?.address as string | undefined;

  const refresh = () => {
    if (!user?.id) return;
    setLoading(true);
    getPriceAlerts(user.id).then((a) => {
      setAlerts(a);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (isPro && user?.id) refresh();
  }, [isPro, user?.id]);

  const handleCreate = async () => {
    setError('');
    const price = Number(target);
    if (!(price > 0)) {
      setError('Entrez un seuil valide.');
      return;
    }
    if (!email) {
      setError('Aucune adresse email associée à votre compte.');
      return;
    }
    setSaving(true);
    const res = await createPriceAlert(user!.id, email, crypto, direction, price);
    setSaving(false);
    if (!res.ok) {
      setError(res.error || "Impossible de créer l'alerte.");
      return;
    }
    setTarget('');
    refresh();
  };

  const handleDelete = async (id: string) => {
    await deletePriceAlert(user!.id, id);
    refresh();
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
          <h1 className="text-2xl font-semibold mb-2">Alertes de prix</h1>
          <p className="text-gray-400 mb-6 max-w-md">Connectez-vous pour gérer vos alertes.</p>
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
          <h1 className="text-2xl font-semibold mb-2">Alertes de prix réservées aux abonnés Pro</h1>
          <p className="text-gray-400 mb-6 max-w-md">Soyez prévenu par email dès qu'un seuil est atteint.</p>
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
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        <div className="flex items-center gap-2 mb-6">
          <BellRing className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold">Alertes de prix</h1>
        </div>

        {/* Création */}
        <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Crypto</label>
              <select
                value={crypto}
                onChange={(e) => setCrypto(e.target.value)}
                className="w-full bg-[#1a1c2e] border border-white/15 text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SUPPORTED.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Condition</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
                className="w-full bg-[#1a1c2e] border border-white/15 text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="above">Monte au-dessus de</option>
                <option value="below">Descend en-dessous de</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Seuil (€)</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#1a1c2e] border border-white/15 text-white placeholder-gray-500 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && <div className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-2.5">{error}</div>}

          <button
            onClick={handleCreate}
            disabled={saving}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-[#534AB7] hover:opacity-90 text-white font-semibold py-2.5 rounded-lg transition-opacity disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Créer l'alerte
          </button>
          <p className="text-[11px] text-gray-500 mt-2">
            Vous serez prévenu à {email || 'votre email'} dès que le seuil est atteint. Ceci n'est pas un conseil en investissement.
          </p>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
        ) : alerts.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">Aucune alerte pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.id} className="flex items-center justify-between bg-[#2d3152] border border-white/10 rounded-xl p-4">
                <div className="text-sm">
                  <span className="font-semibold uppercase">{a.crypto}</span>{' '}
                  <span className="text-gray-400">
                    {a.direction === 'above' ? 'au-dessus de' : 'en-dessous de'} {eur(a.target_price)}
                  </span>
                  {!a.active && (
                    <span className="ml-2 text-[10px] uppercase bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded">déclenchée</span>
                  )}
                </div>
                <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-400 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
