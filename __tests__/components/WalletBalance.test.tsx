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
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders correctly with given wallet address and balances', () => {
    render(
      <WalletBalance 
        walletAddress="0x123abc" 
        solanaWalletAddress="Sol123" 
        bitcoinWalletAddress="bc1q123" 
        balance="1.23" 
        solanaBalance="4.56" 
        bitcoinBalance="0.78" 
      />
    );
    expect(screen.getByText('Solde Total')).toBeInTheDocument();
    expect(screen.getAllByText('1.23')[0]).toBeInTheDocument();
    expect(screen.getByText('0x123abc')).toBeInTheDocument();
    expect(screen.getByText('4.56')).toBeInTheDocument();
    expect(screen.getByText('Sol123')).toBeInTheDocument();
    expect(screen.getByText('0.78')).toBeInTheDocument();
    expect(screen.getByText('bc1q123')).toBeInTheDocument();
  });

  it('copies address to clipboard and updates icon state', async () => {
    render(<WalletBalance walletAddress="0x123abc" />);
    
    const copyBtn = screen.getByRole('button', { name: /copier/i });
    
    act(() => {
      fireEvent.click(copyBtn);
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('0x123abc');
    
    // Icon should change to Check (green-300 in class)
    expect(copyBtn.innerHTML).toContain('lucide-check');

    // Fast forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should revert back to Copy icon
    expect(copyBtn.innerHTML).not.toContain('lucide-check');
  });
});
