import React from 'react';
import { render, screen } from '@testing-library/react';
import { BuyWidget } from '@/components/BuyWidget';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

jest.mock('@/components/MoonPayWidget', () => ({
  MoonPayWidget: ({ crypto, walletAddress }: { crypto: string; walletAddress: string }) => (
    <div data-testid="moonpay-widget">MoonPay {crypto} {walletAddress}</div>
  ),
}));

describe('BuyWidget', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while wallet is not ready yet', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: undefined, solanaWalletAddress: undefined, bitcoinWalletAddress: undefined, createBitcoinWallet: jest.fn() });
    render(<BuyWidget crypto="eth" />);
    expect(screen.getByText(/Création de votre portefeuille/i)).toBeInTheDocument();
    expect(screen.queryByTestId('moonpay-widget')).not.toBeInTheDocument();
  });

  it('renders MoonPayWidget with wallet address', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC', solanaWalletAddress: undefined, bitcoinWalletAddress: undefined, createBitcoinWallet: jest.fn() });
    render(<BuyWidget crypto="eth" />);
    const widget = screen.getByTestId('moonpay-widget');
    expect(widget).toHaveTextContent('MoonPay eth');
    expect(widget).toHaveTextContent('0xABC');
  });
});

