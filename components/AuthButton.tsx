'use client';

import { useAuth } from '@/hooks/useAuth';

export function AuthButton() {
  const { ready, authenticated, user, walletAddress, login, logout } = useAuth();

  if (!ready) return null;

  if (authenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, color: '#555' }}>
          {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
        </span>
        <button onClick={logout}>Déconnexion</button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      style={{
        background: '#534AB7',
        color: '#fff',
        border: 'none',
        padding: '9px 20px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      Créer mon compte
    </button>
  );
}
