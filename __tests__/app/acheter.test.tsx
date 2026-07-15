import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AcheterPage from '@/app/acheter/page';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

let mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/components/BuyWidget', () => ({
  BuyWidget: ({ crypto }: { crypto: string }) => (
    <div data-testid="buy-widget">BuyWidget for {crypto}</div>
  ),
}));

describe('AcheterPage (/acheter)', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('prompts the visitor to sign up when not authenticated, and login is wired to the CTA', () => {
    const mockLogin = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({ authenticated: false, login: mockLogin });

    render(<AcheterPage />);

    expect(screen.getByText('Connecte-toi pour acheter')).toBeInTheDocument();
    expect(screen.queryByTestId('buy-widget')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /créer mon compte gratuitement/i }));
    expect(mockLogin).toHaveBeenCalledTimes(1);
  });

  it('renders the BuyWidget defaulting to btc when authenticated with no crypto param', () => {
    (useAuth as jest.Mock).mockReturnValue({ authenticated: true, login: jest.fn() });

    render(<AcheterPage />);

    expect(screen.getByTestId('buy-widget')).toHaveTextContent('BuyWidget for btc');
  });

  it('passes the requested crypto from the URL to the BuyWidget', () => {
    mockSearchParams = new URLSearchParams('crypto=eth');
    (useAuth as jest.Mock).mockReturnValue({ authenticated: true, login: jest.fn() });

    render(<AcheterPage />);

    expect(screen.getByTestId('buy-widget')).toHaveTextContent('BuyWidget for eth');
  });

  it('always renders the legal footer', () => {
    (useAuth as jest.Mock).mockReturnValue({ authenticated: false, login: jest.fn() });
    render(<AcheterPage />);
    expect(screen.getByRole('link', { name: 'Mentions Légales' })).toBeInTheDocument();
  });
});
