import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SendModal } from '@/components/SendModal';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

describe('SendModal', () => {
  const mockOnClose = jest.fn();
  const mockSendTransaction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      sendTransaction: mockSendTransaction,
    });
    // Set env var to enable the modal
    process.env.NEXT_PUBLIC_ENABLE_SEND = 'true';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ENABLE_SEND;
  });

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    balances: {
      eth: '1.5',
      sol: '10',
    },
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<SendModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows disabled message when NEXT_PUBLIC_ENABLE_SEND is not true', () => {
    process.env.NEXT_PUBLIC_ENABLE_SEND = 'false';
    render(<SendModal {...defaultProps} />);
    expect(screen.getByText('Fonctionnalité désactivée')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /fermer/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates address and amount', async () => {
    render(<SendModal {...defaultProps} />);
    
    const nextButton = screen.getByRole('button', { name: /continuer/i });

    // Try without anything
    fireEvent.click(nextButton);
    expect(screen.getByText('Veuillez entrer une adresse de destination.')).toBeInTheDocument();

    // Fill an invalid address
    const addressInput = screen.getByPlaceholderText('0x...');
    fireEvent.change(addressInput, { target: { value: 'invalid_address' } });
    fireEvent.click(nextButton);
    expect(screen.getByText('Veuillez entrer un montant valide.')).toBeInTheDocument();

    // Fill an invalid amount
    const amountInput = screen.getByPlaceholderText('0.00');
    fireEvent.change(amountInput, { target: { value: '0' } });
    fireEvent.click(nextButton);
    expect(screen.getByText('Veuillez entrer un montant valide.')).toBeInTheDocument();

    // Fill an amount exceeding balance
    fireEvent.change(amountInput, { target: { value: '2' } });
    fireEvent.click(nextButton);
    expect(screen.getByText("L'adresse Ethereum n'est pas valide.")).toBeInTheDocument();

    // Valid ethereum address but amount > balance
    fireEvent.change(addressInput, { target: { value: '0x1234567890123456789012345678901234567890' } });
    fireEvent.click(nextButton);
    expect(screen.getByText('Solde insuffisant.')).toBeInTheDocument();

    // Valid ethereum address and valid amount
    fireEvent.change(amountInput, { target: { value: '0.5' } });
    fireEvent.click(nextButton);

    // Should transition to step 2
    expect(screen.getByText(/Vous allez envoyer/)).toBeInTheDocument();
  });

  it('executes sendTransaction with correct parameters', async () => {
    render(<SendModal {...defaultProps} />);
    
    // Fill step 1
    const addressInput = screen.getByPlaceholderText('0x...');
    const amountInput = screen.getByPlaceholderText('0.00');
    const nextButton = screen.getByRole('button', { name: /continuer/i });

    fireEvent.change(addressInput, { target: { value: '0x1234567890123456789012345678901234567890' } });
    fireEvent.change(amountInput, { target: { value: '0.5' } }); // 0.5 ETH
    fireEvent.click(nextButton);

    // Click confirm in step 2
    const confirmButton = screen.getByRole('button', { name: /confirmer/i });
    
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    // 0.5 * 10^18 = 500000000000000000
    // Hex: 0x6f05b59d3b20000
    expect(mockSendTransaction).toHaveBeenCalledWith({
      to: '0x1234567890123456789012345678901234567890',
      value: '0x6f05b59d3b20000',
      chainId: 11155111,
    });
  });
});
