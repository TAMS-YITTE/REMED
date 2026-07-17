import React from 'react';
import { render, screen } from '@testing-library/react';
import PortefeuillePage from '@/app/portefeuille/page';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

jest.mock('@/app/actions/wallet', () => ({
  getWalletData: jest.fn().mockResolvedValue({ balanceEth: '0.00', transactions: [] }),
  getErc20Balances: jest.fn().mockResolvedValue({})
}));

jest.mock('@/app/actions/solana', () => ({
  getSolanaWalletData: jest.fn().mockResolvedValue({ balanceSol: '0.00', transactions: [] })
}));

jest.mock('@/app/actions/bitcoin', () => ({
  getBitcoinWalletData: jest.fn().mockResolvedValue({ balanceBtc: '0.00', transactions: [] })
}));

jest.mock('@/app/actions/prices', () => ({
  getCryptoPrices: jest.fn().mockResolvedValue({ eth: 3000, sol: 100, btc: 60000 })
}));

jest.mock('@/components/WalletBalance', () => ({
  WalletBalance: ({ walletAddress }: { walletAddress: string }) => (
    <div data-testid="wallet-balance">Balance for {walletAddress}</div>
  ),
}));

jest.mock('@/components/AuthButton', () => ({
  AuthButton: () => <button>Créer mon compte</button>,
}));

jest.mock('@/components/TransactionHistory', () => ({
  TransactionHistory: () => <div data-testid="transaction-history">Transaction History</div>,
}));

jest.mock('@/components/PortfolioDonut', () => ({
  PortfolioDonut: () => <div data-testid="portfolio-donut">Portfolio Donut</div>,
}));

jest.mock('@/components/SendModal', () => ({
  SendModal: () => <div data-testid="send-modal">Send Modal</div>,
}));

describe('PortefeuillePage (/portefeuille)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading state while auth is not ready', () => {
    (useAuth as jest.Mock).mockReturnValue({ isReady: false, authenticated: false });
    const { container } = render(<PortefeuillePage />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Votre Portefeuille')).not.toBeInTheDocument();
  });

  it('shows a restricted-access message when ready but not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({ isReady: true, authenticated: false });
    render(<PortefeuillePage />);
    expect(screen.getByText('Accès restreint')).toBeInTheDocument();
    expect(screen.queryByTestId('wallet-balance')).not.toBeInTheDocument();
  });

  it('shows a "generating wallet" notice when authenticated but no wallet address yet', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isReady: true,
      authenticated: true,
      walletAddress: undefined,
    });
    render(<PortefeuillePage />);
    expect(screen.getByText(/Génération de votre portefeuille en cours/)).toBeInTheDocument();
    expect(screen.queryByTestId('wallet-balance')).not.toBeInTheDocument();
  });

  it('renders the wallet balance and a link to buy more once a wallet exists', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isReady: true,
      authenticated: true,
      walletAddress: '0xABC',
    });
    render(<PortefeuillePage />);

    expect(screen.getByTestId('wallet-balance')).toHaveTextContent('Balance for 0xABC');
    const buyLink = screen.getByRole('link', { name: /acheter des cryptos/i });
    expect(buyLink).toHaveAttribute('href', '/acheter');
  });
});
