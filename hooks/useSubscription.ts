'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSubscriptionStatus, type SubscriptionStatus } from '@/app/actions/subscription';

// Hook d'UI : sert à afficher/masquer le mur d'upgrade, le badge "Pro", etc.
// Ce n'est PAS la barrière de sécurité — toute ressource Premium réelle doit
// re-vérifier l'abonnement côté serveur (voir getSubscriptionStatus), l'état
// client étant falsifiable.
export function useSubscription() {
  const { authenticated, user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!authenticated || !user?.id) {
      setStatus(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getSubscriptionStatus(user.id)
      .then((s) => {
        if (!cancelled) setStatus(s);
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authenticated, user?.id]);

  return { loading, isPro: status?.active ?? false, status };
}
