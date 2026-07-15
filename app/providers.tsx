'use client';

import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useEffect, useState, createContext } from 'react';
import posthog from 'posthog-js';

export const AuthContext = createContext<any>(null);

function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [mockAuth, setMockAuth] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mockAuth');
    if (saved === 'true') setMockAuth(true);
  }, []);

  const login = () => {
    setMockAuth(true);
    localStorage.setItem('mockAuth', 'true');
  };

  const logout = () => {
    setMockAuth(false);
    localStorage.removeItem('mockAuth');
  };

  const value = {
    ready: true,
    authenticated: mockAuth,
    user: mockAuth ? { id: 'mock_user_123' } : null,
    walletAddress: mockAuth ? '0xMockWalletAddress1234567890abcdef1234567' : undefined,
    solanaWalletAddress: mockAuth ? 'MockSoLWa11etAddress1111111111111111111111' : undefined,
    login,
    logout,
    isReady: true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function RealAuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address;

  const embeddedSolanaWallet =
    solanaWallets.find(w => w.standardWallet.name.toLowerCase().includes('privy')) ?? solanaWallets[0];
  const solanaWalletAddress = embeddedSolanaWallet?.address;

  const value = {
    ready,
    authenticated,
    user,
    walletAddress,
    solanaWalletAddress,
    login,
    logout,
    isReady: ready,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY && !process.env.NEXT_PUBLIC_POSTHOG_KEY.includes('votre')) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage',
      });
    }
  }, []);

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const isMock = !appId || appId === 'cldummyappid0000000000000' || appId.includes('votre');

  if (isMock) {
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#534AB7',
          logo: 'https://remedly.fr/logo.png',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
          solana: {
            createOnLogin: 'users-without-wallets',
          },
          noPromptOnSignature: true,
        } as any,
      }}
    >
      <RealAuthProvider>{children}</RealAuthProvider>
    </PrivyProvider>
  );
}
