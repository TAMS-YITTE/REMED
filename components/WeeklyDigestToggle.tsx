'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { updateWeeklyDigestPreference } from '@/app/actions/database';
import { Mail, Sparkles, Check, Loader2 } from 'lucide-react';

export function WeeklyDigestToggle() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleToggle = async (val: boolean) => {
    if (!user?.id || !isPro) return;
    setEnabled(val);
    setSaving(true);
    setSavedMsg(false);
    const res = await updateWeeklyDigestPreference(user.id, val);
    setSaving(false);
    if (res.ok) {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  if (!isPro) {
    return (
      <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-semibold text-white text-sm">Digest Hebdomadaire par E-mail</h3>
              <p className="text-xs text-gray-400">Recevez votre rapport de portefeuille chaque dimanche.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 bg-indigo-500/15 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30">
            <Sparkles className="w-3 h-3" /> Pro
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-semibold text-white text-sm">Digest Hebdomadaire Remedly Pro</h3>
            <p className="text-xs text-gray-400">Synthèse automatique de votre portefeuille envoyée chaque dimanche par e-mail.</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            disabled={saving}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {savedMsg && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
          <Check className="w-3.5 h-3.5" /> Préférence mise à jour avec succès.
        </div>
      )}
    </div>
  );
}
