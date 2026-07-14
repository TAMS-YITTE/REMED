'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';

export function useAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  // Le wallet embarqué créé automatiquement par Privy
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const walletAddress = embeddedWallet?.address;

  return {
    ready,
    authenticated,
    user,
    walletAddress,
    login,
    logout,
  };
}
