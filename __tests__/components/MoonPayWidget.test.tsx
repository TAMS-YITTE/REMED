import React from 'react';
import { render, screen } from '@testing-library/react';
import { MoonPayWidget } from '@/components/MoonPayWidget';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

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
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_MOONPAY_KEY;
  });

  it('renders nothing when there is no wallet address yet', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: undefined });
    const { container } = render(<MoonPayWidget crypto="btc" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the buy widget with the wallet address and requested crypto once a wallet exists', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });
    render(<MoonPayWidget crypto="eth" />);

    const widget = screen.getByTestId('moonpay-buy-widget');
    expect(widget).toHaveAttribute('data-wallet', '0xABC');
    expect(widget).toHaveAttribute('data-currency', 'eth');
    expect(widget).toHaveAttribute('data-base-currency', 'eur');
  });

  it('runs in debug mode when the key is not a live ("pk_live_") key', () => {
    process.env.NEXT_PUBLIC_MOONPAY_KEY = 'pk_test_something';
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });
    render(<MoonPayWidget />);

    expect(screen.getByTestId('moonpay-provider')).toHaveAttribute('data-debug', 'true');
  });

  it('disables debug mode for a live ("pk_live_") key', () => {
    process.env.NEXT_PUBLIC_MOONPAY_KEY = 'pk_live_something';
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });
    render(<MoonPayWidget />);

    expect(screen.getByTestId('moonpay-provider')).toHaveAttribute('data-debug', 'false');
  });
});
