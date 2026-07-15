import React from 'react';
import { render, screen } from '@testing-library/react';
import { MoonPayWidget } from '@/components/MoonPayWidget';

jest.mock('@moonpay/moonpay-react', () => ({
  MoonPayProvider: ({ children, apiKey, debug }: any) => (
    <div data-testid="moonpay-provider" data-api-key={apiKey} data-debug={String(debug)}>
      {children}
    </div>
  ),
  MoonPayBuyWidget: (props: any) => (
    <div
      data-testid="moonpay-buy-widget"
      data-currency={props.defaultCurrencyCode}
      data-wallet={props.walletAddress}
      data-base-currency={props.baseCurrencyCode}
    />
  ),
}));

describe('MoonPayWidget', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_MOONPAY_KEY;
  });

  it('renders the buy widget with the given wallet address and requested crypto', () => {
    process.env.NEXT_PUBLIC_MOONPAY_KEY = 'pk_test_abc123';
    render(<MoonPayWidget crypto="eth" walletAddress="0xABC" />);

    const widget = screen.getByTestId('moonpay-buy-widget');
    expect(widget).toHaveAttribute('data-wallet', '0xABC');
    expect(widget).toHaveAttribute('data-currency', 'eth');
    expect(widget).toHaveAttribute('data-base-currency', 'eur');
  });

  it('passes through whatever wallet address it is given (e.g. a Solana address)', () => {
    process.env.NEXT_PUBLIC_MOONPAY_KEY = 'pk_test_abc123';
    render(<MoonPayWidget crypto="sol" walletAddress="SolWallet11111111" />);

    expect(screen.getByTestId('moonpay-buy-widget')).toHaveAttribute('data-wallet', 'SolWallet11111111');
  });

  it.each([
    ['missing', undefined],
    ['an unfilled "votre_..." placeholder', 'pk_test_votre_cle_moonpay'],
  ])('shows a configuration notice instead of the widget when the key is %s', (_label, value) => {
    if (value !== undefined) process.env.NEXT_PUBLIC_MOONPAY_KEY = value;

    render(<MoonPayWidget crypto="btc" walletAddress="0xABC" />);

    expect(screen.queryByTestId('moonpay-buy-widget')).not.toBeInTheDocument();
    expect(screen.getByText(/n'est pas encore configuré/i)).toBeInTheDocument();
  });

  it('runs in debug mode when the key is not a live ("pk_live_") key', () => {
    process.env.NEXT_PUBLIC_MOONPAY_KEY = 'pk_test_something';
    render(<MoonPayWidget walletAddress="0xABC" />);

    expect(screen.getByTestId('moonpay-provider')).toHaveAttribute('data-debug', 'true');
  });

  it('disables debug mode for a live ("pk_live_") key', () => {
    process.env.NEXT_PUBLIC_MOONPAY_KEY = 'pk_live_something';
    render(<MoonPayWidget walletAddress="0xABC" />);

    expect(screen.getByTestId('moonpay-provider')).toHaveAttribute('data-debug', 'false');
  });
});
