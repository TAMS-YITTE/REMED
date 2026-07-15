import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BuyWidget } from '@/components/BuyWidget';

jest.mock('@/components/MoonPayWidget', () => ({
  MoonPayWidget: ({ crypto }: { crypto: string }) => <div data-testid="moonpay-widget">MoonPay {crypto}</div>
}));

jest.mock('@/components/TransakWidget', () => ({
  TransakWidget: ({ crypto }: { crypto: string }) => <div data-testid="transak-widget">Transak {crypto}</div>
}));

describe('BuyWidget', () => {
  it('renders TransakWidget by default', () => {
    render(<BuyWidget crypto="btc" />);
    expect(screen.getByTestId('transak-widget')).toBeInTheDocument();
    expect(screen.getByTestId('transak-widget')).toHaveTextContent('Transak BTC');
    expect(screen.queryByTestId('moonpay-widget')).not.toBeInTheDocument();
  });

  it('switches to MoonPayWidget when clicking the alternative link', () => {
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
