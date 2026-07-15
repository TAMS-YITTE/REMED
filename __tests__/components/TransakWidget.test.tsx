import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransakWidget } from '@/components/TransakWidget';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

function getIframeSrc(): URL {
  const iframe = document.querySelector('iframe');
  expect(iframe).not.toBeNull();
  return new URL(iframe!.getAttribute('src')!);
}

describe('TransakWidget', () => {
  const originalKey = process.env.NEXT_PUBLIC_TRANSAK_KEY;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_TRANSAK_KEY;
    else process.env.NEXT_PUBLIC_TRANSAK_KEY = originalKey;
    jest.clearAllMocks();
  });

  it('renders nothing when there is no wallet address yet', () => {
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'test-live-key-123';
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: undefined });
    const { container } = render(<TransakWidget crypto="BTC" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    ['missing', undefined],
    ['an unfilled "votre_..." placeholder', 'votre_cle_transak'],
  ])('shows a configuration notice instead of an iframe when the key is %s', (_label, value) => {
    if (value === undefined) delete process.env.NEXT_PUBLIC_TRANSAK_KEY;
    else process.env.NEXT_PUBLIC_TRANSAK_KEY = value;
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });

    render(<TransakWidget crypto="BTC" />);

    expect(document.querySelector('iframe')).not.toBeInTheDocument();
    expect(screen.getByText(/n'est pas encore configuré/i)).toBeInTheDocument();
  });

  it('builds the checkout iframe with the wallet address, crypto and EUR once a real key exists', () => {
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'test-live-key-123';
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });

    render(<TransakWidget crypto="ETH" />);

    const url = getIframeSrc();
    expect(url.searchParams.get('apiKey')).toBe('test-live-key-123');
    expect(url.searchParams.get('walletAddress')).toBe('0xABC');
    expect(url.searchParams.get('defaultCryptoCurrency')).toBe('ETH');
    expect(url.searchParams.get('fiatCurrency')).toBe('EUR');
  });

  it('points at the staging domain when the key contains "STAGING"', () => {
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'STAGING-test-key';
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });

    render(<TransakWidget crypto="BTC" />);

    expect(getIframeSrc().origin).toBe('https://global-stg.transak.com');
  });

  it('points at the production domain for a non-staging key', () => {
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'test-live-key-123';
    (useAuth as jest.Mock).mockReturnValue({ walletAddress: '0xABC' });

    render(<TransakWidget crypto="BTC" />);

    expect(getIframeSrc().origin).toBe('https://global.transak.com');
  });
});
