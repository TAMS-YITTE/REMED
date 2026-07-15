import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WalletBalance } from '@/components/WalletBalance';

describe('WalletBalance', () => {
  const originalClipboard = navigator.clipboard;
  
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(),
      },
      configurable: true,
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly with given wallet address', () => {
    render(<WalletBalance walletAddress="0x123abc" />);
    expect(screen.getByText('Solde Total (Est.)')).toBeInTheDocument();
    expect(screen.getByText('0,00 €')).toBeInTheDocument();
    expect(screen.getByText('0x123abc')).toBeInTheDocument();
  });

  it('copies address to clipboard and changes button text', async () => {
    render(<WalletBalance walletAddress="0x123abc" />);
    
    const copyBtn = screen.getByRole('button', { name: /copier/i });
    expect(copyBtn).toHaveTextContent('Copier');

    fireEvent.click(copyBtn);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('0x123abc');
    expect(copyBtn).toHaveTextContent('Copié !');

    // Fast forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(copyBtn).toHaveTextContent('Copier');
  });
});
