'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useContext, useState, useEffect } from 'react';
import { MockAuthContext } from '@/app/providers';

export function useAuth() {
  const context = useContext(MockAuthContext);
  const isMock = context?.isMock;

  // État local mocké
  const [mockAuth, setMockAuth] = useState(false);

  useEffect(() => {
    if (isMock) {
      const saved = localStorage.getItem('mockAuth');
      if (saved === 'true') setMockAuth(true);
    }
  }, [isMock]);

  const mockLogin = () => {
    setMockAuth(true);
    localStorage.setItem('mockAuth', 'true');
  };

  const mockLogout = () => {
    setMockAuth(false);
    localStorage.removeItem('mockAuth');
  };

  if (isMock) {
    return {
      ready: true,
      authenticated: mockAuth,
      user: mockAuth ? { id: 'mock_user_123' } : null,
      walletAddress: mockAuth ? '0xMockWalletAddress1234567890abcdef1234567' : undefined,
      login: mockLogin,
      logout: mockLogout,
      isReady: true,
    };
  }

  // Vrai environnement Privy
  return useRealAuth();
}

function useRealAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address;

  return {
    ready,
    authenticated,
    user,
    walletAddress,
    login,
    logout,
    isReady: ready,
  };
}
