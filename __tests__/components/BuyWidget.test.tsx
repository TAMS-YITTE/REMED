import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BuyWidget } from '@/components/BuyWidget';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

jest.mock('@/components/MoonPayWidget', () => ({
  MoonPayWidget: ({ crypto }: { crypto: string }) => <div data-testid="moonpay-widget">MoonPay {crypto}</div>
}));

jest.mock('@/components/TransakWidget', () => ({
  TransakWidget: ({ crypto }: { crypto: string }) => <div data-testid="transak-widget">Transak {crypto}</div>
}));

describe('BuyWidget', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a "creating wallet" loading state while the wallet address is not ready yet', () => {
    // This is the authenticated-but-no-wallet-yet window (embedded wallet
    // creation is async after Privy login) that used to render the payment
    // provider widgets with an undefined wallet address and crash the page.
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: undefined });

    render(<BuyWidget crypto="btc" />);

    expect(screen.getByText(/Création de votre portefeuille/i)).toBeInTheDocument();
    expect(screen.queryByTestId('transak-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('moonpay-widget')).not.toBeInTheDocument();
  });

  it('renders TransakWidget by default once a wallet address exists', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });

    render(<BuyWidget crypto="btc" />);
    expect(screen.getByTestId('transak-widget')).toBeInTheDocument();
    expect(screen.getByTestId('transak-widget')).toHaveTextContent('Transak BTC');
    expect(screen.queryByTestId('moonpay-widget')).not.toBeInTheDocument();
  });

  it('switches to MoonPayWidget when clicking the alternative link', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });

    render(<BuyWidget crypto="eth" />);

    const switchBtn = screen.getByText(/Problème avec le paiement \?/i);
    fireEvent.click(switchBtn);

    expect(screen.queryByTestId('transak-widget')).not.toBeInTheDocument();
    expect(screen.getByTestId('moonpay-widget')).toBeInTheDocument();
    expect(screen.getByTestId('moonpay-widget')).toHaveTextContent('MoonPay eth');

    // Switch back to transak
    fireEvent.click(switchBtn);
    expect(screen.getByTestId('transak-widget')).toBeInTheDocument();
  });
});
