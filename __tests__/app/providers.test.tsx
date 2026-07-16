import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// This suite exercises the real Providers/isMock branching logic, so undo
// the blanket mock installed in jest.setup.ts for every other test file.
jest.unmock('@/app/providers');

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: { init: jest.fn() },
}));

const mockUsePrivy = jest.fn();
const mockUseWallets = jest.fn();
const mockUseSolanaWallets = jest.fn();
const mockUseCreateWallet = jest.fn();

jest.mock('@privy-io/react-auth', () => ({
  PrivyProvider: ({ children, appId }: any) => (
    <div data-testid="privy-provider" data-app-id={appId}>
      {children}
    </div>
  ),
  usePrivy: () => mockUsePrivy(),
  useWallets: () => mockUseWallets(),
}));

// Mocked instead of transformed for real: it pulls in ESM-only transitive
// deps (e.g. ofetch) that aren't worth teaching Jest to parse for a unit test.
jest.mock('@privy-io/react-auth/solana', () => ({
  useWallets: () => mockUseSolanaWallets(),
}));

jest.mock('@privy-io/react-auth/extended-chains', () => ({
  useCreateWallet: () => mockUseCreateWallet(),
}));

import { Providers } from '@/app/providers';
import { useAuth } from '@/hooks/useAuth';

function Consumer() {
  const { ready, authenticated, walletAddress, solanaWalletAddress, bitcoinWalletAddress, createBitcoinWallet, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="ready">{String(ready)}</span>
      <span data-testid="authenticated">{String(authenticated)}</span>
      <span data-testid="wallet">{walletAddress ?? 'none'}</span>
      <span data-testid="solana-wallet">{solanaWalletAddress ?? 'none'}</span>
      <span data-testid="bitcoin-wallet">{bitcoinWalletAddress ?? 'none'}</span>
      <button onClick={createBitcoinWallet}>createBitcoin</button>
      <button onClick={login}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('Providers', () => {
  const originalEnv = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  beforeEach(() => {
    mockUsePrivy.mockReturnValue({
      ready: true,
      authenticated: true,
      user: { id: 'u1', linkedAccounts: [] },
      login: jest.fn(),
      logout: jest.fn(),
    });
    mockUseWallets.mockReturnValue({ wallets: [] });
    mockUseSolanaWallets.mockReturnValue({ wallets: [] });
    // Providers.tsx now auto-creates a Bitcoin wallet on login (mirroring
    // ETH/SOL), so createWallet must resolve like the real Privy hook does.
    mockUseCreateWallet.mockReturnValue({ createWallet: jest.fn().mockResolvedValue({}) });
  });

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    else process.env.NEXT_PUBLIC_PRIVY_APP_ID = originalEnv;
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  describe('mock mode (no usable Privy app id)', () => {
    it.each([
      ['missing app id', undefined],
      ['known dummy placeholder', 'cldummyappid0000000000000'],
      ['unreplaced "votre" placeholder', 'votre_app_id_ici'],
    ])('falls back to the mock auth provider when appId is %s', (_label, value) => {
      if (value === undefined) delete process.env.NEXT_PUBLIC_PRIVY_APP_ID;
      else process.env.NEXT_PUBLIC_PRIVY_APP_ID = value;

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      expect(screen.queryByTestId('privy-provider')).not.toBeInTheDocument();
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    it('login/logout toggle mock authentication and persist to localStorage', () => {
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'cldummyappid0000000000000';

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      fireEvent.click(screen.getByText('login'));
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('wallet').textContent).toMatch(/^0x/);
      expect(window.localStorage.getItem('mockAuth')).toBe('true');

      fireEvent.click(screen.getByText('logout'));
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(window.localStorage.getItem('mockAuth')).toBeNull();
    });

    it('restores a previous mock session from localStorage on mount', () => {
      window.localStorage.setItem('mockAuth', 'true');
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'cldummyappid0000000000000';

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  describe('real mode (usable Privy app id)', () => {
    it('mounts PrivyProvider with the configured appId', () => {
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'clreallooking1234567890';

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      const provider = screen.getByTestId('privy-provider');
      expect(provider).toHaveAttribute('data-app-id', 'clreallooking1234567890');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    it('exposes the embedded (privy) Ethereum wallet address, ignoring external wallets', () => {
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'clreallooking1234567890';
      mockUseWallets.mockReturnValue({
        wallets: [
          { walletClientType: 'metamask', address: '0xEXTERNAL' },
          { walletClientType: 'privy', address: '0xEMBEDDED' },
        ],
      });

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      expect(screen.getByTestId('wallet')).toHaveTextContent('0xEMBEDDED');
    });

    it('reports no Ethereum wallet address when only external wallets are connected', () => {
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'clreallooking1234567890';
      mockUseWallets.mockReturnValue({
        wallets: [{ walletClientType: 'metamask', address: '0xEXTERNAL' }],
      });

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      expect(screen.getByTestId('wallet')).toHaveTextContent('none');
    });

    it('exposes the embedded (privy) Solana wallet address, preferring the wallet named "Privy"', () => {
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'clreallooking1234567890';
      mockUseSolanaWallets.mockReturnValue({
        wallets: [
          { standardWallet: { name: 'Phantom' }, address: 'ExternalSolWallet111' },
          { standardWallet: { name: 'Privy' }, address: 'EmbeddedSolWallet222' },
        ],
      });

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      expect(screen.getByTestId('solana-wallet')).toHaveTextContent('EmbeddedSolWallet222');
    });

    it('falls back to the first Solana wallet when none is named "Privy"', () => {
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'clreallooking1234567890';
      mockUseSolanaWallets.mockReturnValue({
        wallets: [{ standardWallet: { name: 'SomeWallet' }, address: 'OnlySolWallet333' }],
      });

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      expect(screen.getByTestId('solana-wallet')).toHaveTextContent('OnlySolWallet333');
    });

    it('reports no Solana wallet address when none are connected', () => {
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'clreallooking1234567890';

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      expect(screen.getByTestId('solana-wallet')).toHaveTextContent('none');
    });

    it('exposes the bitcoin taproot wallet address from user linkedAccounts', () => {
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'clreallooking1234567890';
      mockUsePrivy.mockReturnValue({
        ready: true,
        authenticated: true,
        user: { 
          id: 'u1',
          linkedAccounts: [
            { type: 'wallet', chainType: 'ethereum', address: '0xIgnore' },
            { type: 'wallet', chainType: 'bitcoin-taproot', address: 'bc1qtest123' },
          ]
        },
        login: jest.fn(),
        logout: jest.fn(),
      });

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      expect(screen.getByTestId('bitcoin-wallet')).toHaveTextContent('bc1qtest123');
    });

    it('calls createWallet with bitcoin-taproot when createBitcoinWallet is invoked', () => {
      process.env.NEXT_PUBLIC_PRIVY_APP_ID = 'clreallooking1234567890';
      const mockCreate = jest.fn().mockResolvedValue({});
      mockUseCreateWallet.mockReturnValue({ createWallet: mockCreate });

      render(
        <Providers>
          <Consumer />
        </Providers>
      );

      fireEvent.click(screen.getByText('createBitcoin'));
      expect(mockCreate).toHaveBeenCalledWith({ chainType: 'bitcoin-taproot' });
    });
  });
});
