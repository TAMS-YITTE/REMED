'use client';

import { useContext } from 'react';
import { AuthContext } from '@/app/providers';

export interface AuthContextType {
  ready: boolean;
  authenticated: boolean;
  user: any;
  walletAddress?: string;
  solanaWalletAddress?: string;
  bitcoinWalletAddress?: string;
  createBitcoinWallet: () => Promise<void>;
  login: () => void;
  logout: () => void;
  isReady: boolean;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within Providers');
  }
  return context;
}
