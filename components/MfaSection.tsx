'use client';

import { useMfaEnrollment } from '@privy-io/react-auth';
import { useAuth } from '@/hooks/useAuth';

export function MfaSection() {
  const { showMfaEnrollmentModal } = useMfaEnrollment();
  const { user } = useAuth();

  const isTotpEnrolled = Boolean(user?.mfaMethods?.includes('totp'));

  return (
    <section className="glass-panel rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-semibold mb-2">Sécurité</h2>
      <p className="text-sm text-gray-400 mb-4">
        Ajoutez une couche de protection supplémentaire à votre portefeuille avec une application d&apos;authentification (Google Authenticator, Authy...).
      </p>

      {isTotpEnrolled ? (
        <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <span>✓</span>
          Authentification à deux facteurs activée
        </div>
      ) : (
        <button
          onClick={showMfaEnrollmentModal}
          className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold px-5 py-3 rounded-xl text-sm"
        >
          Activer l&apos;authentification à deux facteurs (2FA)
        </button>
      )}
    </section>
  );
}
