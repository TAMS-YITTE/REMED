'use client';

import { useAuth } from '@/hooks/useAuth';
import { BuyWidget } from '@/components/BuyWidget';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AcheterContent() {
  const { authenticated, login } = useAuth();
  const searchParams = useSearchParams();
  const crypto = searchParams.get('crypto') || 'btc';

  if (!authenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2>Connecte-toi pour acheter</h2>
        <p style={{ color: '#555', margin: '1rem 0 2rem' }}>
          Un wallet sécurisé sera créé automatiquement pour toi.
        </p>
        <button
          onClick={login}
          style={{
            background: '#534AB7',
            color: '#fff',
            border: 'none',
            padding: '12px 28px',
            borderRadius: 8,
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          Créer mon compte gratuitement
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: '1.5rem' }}>
        Acheter de la crypto
      </h1>
      <BuyWidget crypto={crypto} />
    </div>
  );
}

export default function AcheterPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <AcheterContent />
    </Suspense>
  );
}
