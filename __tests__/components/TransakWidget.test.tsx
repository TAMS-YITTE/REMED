import React from 'react';
import { render } from '@testing-library/react';
import { TransakWidget } from '@/components/TransakWidget';
import { useAuth } from '@/hooks/useAuth';
import { Transak } from '@transak/transak-sdk';

jest.mock('@/hooks/useAuth');

jest.mock('@transak/transak-sdk', () => {
  const instanceMocks = { init: jest.fn(), close: jest.fn() };
  const TransakMock: any = jest.fn().mockImplementation(() => instanceMocks);
  TransakMock.EVENTS = { TRANSAK_ORDER_SUCCESSFUL: 'TRANSAK_ORDER_SUCCESSFUL' };
  TransakMock.on = jest.fn();
  TransakMock.__instanceMocks = instanceMocks;
  return { Transak: TransakMock };
});

const mockInit = (Transak as any).__instanceMocks.init;
const mockClose = (Transak as any).__instanceMocks.close;

describe('TransakWidget', () => {
  // Clear in beforeEach (not afterEach): the previous test's leftover render
  // is torn down by Testing Library's automatic cleanup() *after* an
  // afterEach here would run, so a stray close() call would otherwise leak
  // into the next test's call count.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_TRANSAK_KEY;
  });

  it('does not initialize Transak when there is no wallet address yet', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: undefined });
    render(<TransakWidget crypto="BTC" />);
    expect(Transak).not.toHaveBeenCalled();
  });

  it('initializes Transak with the wallet address, crypto and EUR once a wallet exists', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });
    render(<TransakWidget crypto="ETH" />);

    expect(Transak).toHaveBeenCalledTimes(1);
    const config = (Transak as unknown as jest.Mock).mock.calls[0][0];
    expect(config.walletAddress).toBe('0xABC');
    expect(config.defaultCryptoCurrency).toBe('ETH');
    expect(config.fiatCurrency).toBe('EUR');
    expect(mockInit).toHaveBeenCalledTimes(1);
  });

  it('uses the STAGING environment when the key contains "STAGING" or is unset', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'STAGING-key-123';
    render(<TransakWidget crypto="BTC" />);

    const config = (Transak as unknown as jest.Mock).mock.calls[0][0];
    expect(config.environment).toBe('STAGING');
  });

  it('uses the PRODUCTION environment when a non-staging key is configured', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'live-key-123';
    render(<TransakWidget crypto="BTC" />);

    const config = (Transak as unknown as jest.Mock).mock.calls[0][0];
    expect(config.environment).toBe('PRODUCTION');
  });

  it('closes the Transak widget on unmount', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });
    const { unmount } = render(<TransakWidget crypto="BTC" />);
    unmount();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('closes the widget when Transak reports a successful order', () => {
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });
    render(<TransakWidget crypto="BTC" />);

    const TransakMock = Transak as any;
    expect(TransakMock.on).toHaveBeenCalledWith(
      TransakMock.EVENTS.TRANSAK_ORDER_SUCCESSFUL,
      expect.any(Function)
    );

    const onOrderSuccessful = (TransakMock.on as jest.Mock).mock.calls[0][1];
    onOrderSuccessful({ status: 'COMPLETED' });

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
