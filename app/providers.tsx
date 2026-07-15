'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { useEffect, useState, createContext } from 'react';
import posthog from 'posthog-js';

export const MockAuthContext = createContext<any>(null);

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
    // Mode mock local quand les clés ne sont pas configurées
    return (
      <MockAuthContext.Provider value={{ isMock: true }}>
        {children}
      </MockAuthContext.Provider>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#534AB7',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: true,
        } as any,
      }}
    >
      <MockAuthContext.Provider value={{ isMock: false }}>
        {children}
      </MockAuthContext.Provider>
    </PrivyProvider>
  );
}
