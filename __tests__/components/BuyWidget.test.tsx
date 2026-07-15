import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BuyWidget } from '@/components/BuyWidget';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

jest.mock('@/components/MoonPayWidget', () => ({
  MoonPayWidget: ({ crypto, walletAddress }: { crypto: string; walletAddress: string }) => (
    <div data-testid="moonpay-widget">MoonPay {crypto} {walletAddress}</div>
  ),
}));

jest.mock('@/components/TransakWidget', () => ({
  TransakWidget: ({ crypto, walletAddress }: { crypto: string; walletAddress: string }) => (
    <div data-testid="transak-widget">Transak {crypto} {walletAddress}</div>
  ),
}));

describe('BuyWidget', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a "creating wallet" loading state while the Ethereum wallet is not ready yet', () => {
    // Authenticated-but-no-wallet-yet window (embedded wallet creation is
    // async after Privy login): rendering a payment widget here with an
    // undefined address is what used to crash the page.
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: undefined, solanaWalletAddress: undefined, bitcoinWalletAddress: undefined, createBitcoinWallet: jest.fn() });

    render(<BuyWidget crypto="eth" />);

    expect(screen.getByText(/Création de votre portefeuille/i)).toBeInTheDocument();
    expect(screen.queryByTestId('transak-widget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('moonpay-widget')).not.toBeInTheDocument();
  });

  it('shows a "creating wallet" loading state while the Solana wallet is not ready yet, for a Solana purchase', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC', solanaWalletAddress: undefined, bitcoinWalletAddress: undefined, createBitcoinWallet: jest.fn() });

    render(<BuyWidget crypto="sol" />);

    expect(screen.getByText(/Création de votre portefeuille/i)).toBeInTheDocument();
    expect(screen.queryByTestId('transak-widget')).not.toBeInTheDocument();
  });

  it('shows a "creating wallet" loading state and calls createBitcoinWallet for a Bitcoin purchase when the wallet is missing', () => {
    const mockCreateBitcoinWallet = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC', solanaWalletAddress: 'SolWallet1', bitcoinWalletAddress: undefined, createBitcoinWallet: mockCreateBitcoinWallet });

    render(<BuyWidget crypto="btc" />);

    expect(screen.getByText(/Création de votre portefeuille/i)).toBeInTheDocument();
    expect(mockCreateBitcoinWallet).toHaveBeenCalled();
    expect(screen.queryByTestId('transak-widget')).not.toBeInTheDocument();
  });

  it('renders TransakWidget with the Bitcoin wallet address for a BTC purchase once the wallet exists', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC', solanaWalletAddress: 'SolWallet1', bitcoinWalletAddress: 'bc1qtest123', createBitcoinWallet: jest.fn() });

    render(<BuyWidget crypto="btc" />);
    const widget = screen.getByTestId('transak-widget');
    expect(widget).toHaveTextContent('Transak BTC');
    expect(widget).toHaveTextContent('bc1qtest123');
  });

  it('renders TransakWidget by default with the Ethereum wallet address for an ETH purchase', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC', solanaWalletAddress: undefined, bitcoinWalletAddress: undefined, createBitcoinWallet: jest.fn() });

    render(<BuyWidget crypto="eth" />);
    const widget = screen.getByTestId('transak-widget');
    expect(widget).toHaveTextContent('Transak ETH');
    expect(widget).toHaveTextContent('0xABC');
    expect(screen.queryByTestId('moonpay-widget')).not.toBeInTheDocument();
  });

  it('renders TransakWidget with the Solana wallet address for a SOL purchase', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC', solanaWalletAddress: 'SolWallet1', bitcoinWalletAddress: undefined, createBitcoinWallet: jest.fn() });

    render(<BuyWidget crypto="sol" />);
    const widget = screen.getByTestId('transak-widget');
    expect(widget).toHaveTextContent('Transak SOL');
    expect(widget).toHaveTextContent('SolWallet1');
  });

  it('switches to MoonPayWidget when clicking the alternative link', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC', solanaWalletAddress: undefined, bitcoinWalletAddress: undefined, createBitcoinWallet: jest.fn() });

    render(<BuyWidget crypto="eth" />);

    const switchBtn = screen.getByRole('button', { name: /Utiliser MoonPay/i });
    fireEvent.click(switchBtn);

    expect(screen.queryByTestId('transak-widget')).not.toBeInTheDocument();
    expect(screen.getByTestId('moonpay-widget')).toBeInTheDocument();
    expect(screen.getByTestId('moonpay-widget')).toHaveTextContent('MoonPay eth');

    // Switch back to transak
    fireEvent.click(switchBtn);
    expect(screen.getByTestId('transak-widget')).toBeInTheDocument();
  });
});
