'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { useEffect } from 'react';
import posthog from 'posthog-js';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
        capture_pageview: true,
        capture_pageleave: true,
        persistence: 'localStorage',
      });
    }
  }, []);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cldummyappid0000000000000'}
      config={{
        loginMethods: ['email'],
        appearance: {
          theme: 'light',
          accentColor: '#534AB7',
          logo: 'https://remedly.fr/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: true,
        } as any,
      }}
    >
      {children}
    </PrivyProvider>
  );
}
