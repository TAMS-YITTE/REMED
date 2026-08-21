import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SendModal } from '@/components/SendModal';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

// Le bundle Solana de Privy n'est pas transformable par jest (syntaxe non
// standard dans ses sources). On le remplace : ce test porte sur l'UI du
// modal, pas sur le SDK.
jest.mock('@privy-io/react-auth/solana', () => ({
  useSignTransaction: () => ({ signTransaction: jest.fn() }),
  useWallets: () => ({ ready: true, wallets: [] }),
}));

jest.mock('@/app/actions/solana', () => ({
  getSolanaBlockhash: jest.fn(),
  sendRawSolanaTransaction: jest.fn(),
}));

jest.mock('@privy-io/react-auth/extended-chains', () => ({
  useSignRawHash: () => ({ signRawHash: jest.fn() }),
}));

// @scure/btc-signer est en ESM pur : hors sujet pour un test d'interface.
// L'arithmétique Bitcoin, elle, est testée à part dans bitcoinPlan.test.ts.
jest.mock('@/lib/bitcoinSend', () => ({
  btcToSats: (v: string) => BigInt(Math.round(Number(v) * 1e8)),
  buildTransfer: jest.fn(),
  finalizeTransfer: jest.fn(),
  isValidBitcoinAddress: (v: string) => /^(bc1|[13])[a-zA-Z0-9]{20,}$/.test(v),
}));

jest.mock('@/app/actions/bitcoin', () => ({
  getBitcoinUtxos: jest.fn(),
  getBitcoinFeeRates: jest.fn(),
  broadcastBitcoinTransaction: jest.fn(),
}));

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
      chainId: 1,
    });
  });
});

describe('SendModal - envoi Solana', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      sendTransaction: jest.fn(),
      solanaWalletAddress: 'G9FJ4p4Jn3DQgyqksPhS5MuHi2VdTE9VGaTDwcFY2TeA',
    });
    process.env.NEXT_PUBLIC_ENABLE_SEND = 'true';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_ENABLE_SEND;
  });

  const props = {
    isOpen: true,
    onClose: mockOnClose,
    balances: { eth: '1.5', sol: '10' },
  };

  function selectSolana() {
    const select = screen.getAllByRole('combobox')[0];
    fireEvent.change(select, { target: { value: 'SOL' } });
    return select;
  }

  it('propose SOL et BTC à l\'envoi', () => {
    render(<SendModal {...props} />);
    const select = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
    const options = Array.from(select.options);

    const sol = options.find((o) => o.value === 'SOL');
    const btc = options.find((o) => o.value === 'BTC');

    expect(sol).toBeDefined();
    expect(sol!.disabled).toBe(false);
    expect(btc).toBeDefined();
    expect(btc!.disabled).toBe(false);
  });

  it('annonce le réseau Solana une fois SOL sélectionné', () => {
    render(<SendModal {...props} />);
    selectSolana();
    expect(
      screen.getByText(/Réseau Solana. Envoyez uniquement vers une adresse Solana./i)
    ).toBeInTheDocument();
  });

  it('refuse une adresse Ethereum quand SOL est sélectionné (envoi inter-chaînes = fonds perdus)', () => {
    render(<SendModal {...props} />);
    selectSolana();

    fireEvent.change(screen.getByPlaceholderText('Adresse Solana...'), {
      target: { value: '0xA70B325B96Ba7837F49DC750fC6c72ea2C035F99' },
    });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

    expect(screen.getByText("L'adresse Solana n'est pas valide.")).toBeInTheDocument();
  });

  it('vide l\'adresse quand on change de famille de chaîne', () => {
    render(<SendModal {...props} />);

    fireEvent.change(screen.getByPlaceholderText('0x...'), {
      target: { value: '0xA70B325B96Ba7837F49DC750fC6c72ea2C035F99' },
    });
    selectSolana();

    expect((screen.getByPlaceholderText('Adresse Solana...') as HTMLInputElement).value).toBe('');
  });

  it('accepte une adresse Solana valide et affiche le récapitulatif Solana', () => {
    render(<SendModal {...props} />);
    selectSolana();

    fireEvent.change(screen.getByPlaceholderText('Adresse Solana...'), {
      target: { value: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM' },
    });
    fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: /continuer/i }));

    expect(screen.getByText('Solana')).toBeInTheDocument();
    expect(screen.getByText(/payés en SOL/i)).toBeInTheDocument();
  });
});
