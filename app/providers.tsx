'use client';

import { PrivyProvider, usePrivy, useWallets, useMfa, useRegisterMfaListener } from '@privy-io/react-auth';
import { useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useCreateWallet } from '@privy-io/react-auth/extended-chains';
import { useEffect, useState, createContext } from 'react';
import posthog from 'posthog-js';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { isPrivyMock } from '@/lib/privyMode';
import { syncUserWallets } from '@/app/actions/database';

export const AuthContext = createContext<any>(null);

function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [mockAuth, setMockAuth] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mockAuth');
    if (saved === 'true') setMockAuth(true);
  }, []);

  useEffect(() => {
    if (mockAuth) {
      syncUserWallets('mock_user_123', {
        eth: '0xMockWalletAddress1234567890abcdef1234567',
        sol: 'MockSoLWa11etAddress1111111111111111111111',
        btc: 'bc1qmockwalletaddress1234567890abcdef123',
        email: 'test@remedly.fr',
      }).catch(console.error);
    }
  }, [mockAuth]);

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
    bitcoinWalletAddress: mockAuth ? 'bc1qmockwalletaddress1234567890abcdef123' : undefined,
    createBitcoinWallet: async () => { console.log('Mock createBitcoinWallet called'); },
    login,
    logout,
    sendTransaction: async (tx: any) => {
      console.log('Mock sendTransaction called with:', tx);
      return { transactionHash: '0xmocktransactionhash1234567890' };
    },
    isReady: true,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function RealAuthProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, user, login, logout, sendTransaction } = usePrivy();
  const { wallets } = useWallets();
  const { wallets: solanaWallets } = useSolanaWallets();
  const { createWallet } = useCreateWallet();

  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address;

  const embeddedSolanaWallet =
    solanaWallets.find(w => w.standardWallet.name.toLowerCase().includes('privy')) ?? solanaWallets[0];
  const solanaWalletAddress = embeddedSolanaWallet?.address;

  const bitcoinAccount = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'bitcoin-taproot'
  ) as any;
  const bitcoinWalletAddress = bitcoinAccount?.address;

  const createBitcoinWallet = async () => {
    if (!bitcoinWalletAddress) {
      await createWallet({ chainType: 'bitcoin-taproot' });
    }
  };

  useEffect(() => {
    if (ready && authenticated && user && !bitcoinWalletAddress) {
      createWallet({ chainType: 'bitcoin-taproot' }).catch(console.error);
    }
  }, [ready, authenticated, user, bitcoinWalletAddress, createWallet]);

  useEffect(() => {
    if (ready && authenticated && user?.id) {
      const email = user.email?.address as string | undefined;
      syncUserWallets(user.id, {
        eth: walletAddress,
        sol: solanaWalletAddress,
        btc: bitcoinWalletAddress,
        email,
      }).catch(console.error);
    }
  }, [ready, authenticated, user?.id, user?.email?.address, walletAddress, solanaWalletAddress, bitcoinWalletAddress]);

  const value = {
    ready,
    authenticated,
    user,
    walletAddress,
    solanaWalletAddress,
    bitcoinWalletAddress,
    createBitcoinWallet,
    login,
    logout,
    sendTransaction,
    isReady: ready,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Quand un utilisateur a activé la 2FA, Privy exige une validation MFA avant
// de signer. Sans ce listener, l'événement n'est traité par personne : aucune
// fenêtre ne s'ouvre, la promesse de signature ne se résout jamais et
// l'interface tourne indéfiniment (constaté au premier envoi SOL réel).
// `promptMfa` est la fenêtre de saisie fournie par Privy.
function MfaListener() {
  const { promptMfa } = useMfa();

  useRegisterMfaListener({
    onMfaRequired: () => {
      promptMfa().catch((error) => {
        console.error('Erreur lors de la validation MFA :', error);
      });
    },
  });

  return null;
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
  const isMock = isPrivyMock();

  if (isMock || !appId) {
    return (
      <LanguageProvider>
        <MockAuthProvider>{children}</MockAuthProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
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
            // `noPromptOnSignature` figurait ici : cette clé n'existe pas
            // dans le SDK v3 (le cast `as any` masquait l'erreur), elle
            // était donc ignorée depuis le début — l'interface de Privy
            // était donc active sans qu'on le sache.
            //
            // Elle est désormais désactivée. Au moment de signer, Privy
            // ouvrait sa propre fenêtre dans une iframe : celle-ci
            // n'aboutissait pas ("This page couldn't load"), et l'attente
            // de sa réponse expliquait l'envoi SOL bloqué sans message.
            // L'application a déjà son écran de confirmation avant tout
            // envoi (garde-fou du CLAUDE.md), et la validation 2FA passe
            // par MfaListener ci-dessus.
            showWalletUIs: false,
          },

        }}
      >
        <MfaListener />
        <RealAuthProvider>{children}</RealAuthProvider>
      </PrivyProvider>
    </LanguageProvider>
  );
}
