import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransakWidget } from '@/components/TransakWidget';

function getIframeSrc(): URL {
  const iframe = document.querySelector('iframe');
  expect(iframe).not.toBeNull();
  return new URL(iframe!.getAttribute('src')!);
}

describe('TransakWidget', () => {
  const originalKey = process.env.NEXT_PUBLIC_TRANSAK_KEY;
  const originalEnv = process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_TRANSAK_KEY;
    else process.env.NEXT_PUBLIC_TRANSAK_KEY = originalKey;
    if (originalEnv === undefined) delete process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT;
    else process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT = originalEnv;
  });

  it.each([
    ['missing', undefined],
    ['an unfilled "votre_..." placeholder', 'votre_cle_transak'],
  ])('shows a configuration notice instead of an iframe when the key is %s', (_label, value) => {
    if (value === undefined) delete process.env.NEXT_PUBLIC_TRANSAK_KEY;
    else process.env.NEXT_PUBLIC_TRANSAK_KEY = value;

    render(<TransakWidget crypto="BTC" walletAddress="0xABC" />);

    expect(document.querySelector('iframe')).not.toBeInTheDocument();
    expect(screen.getByText('Clé Transak manquante')).toBeInTheDocument();
  });

  it('builds the checkout iframe with the given wallet address, crypto and EUR once a real key exists', () => {
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'test-live-key-123';

    render(<TransakWidget crypto="ETH" walletAddress="0xABC" />);

    const url = getIframeSrc();
    expect(url.searchParams.get('apiKey')).toBe('test-live-key-123');
    expect(url.searchParams.get('walletAddress')).toBe('0xABC');
    expect(url.searchParams.get('defaultCryptoCurrency')).toBe('ETH');
    expect(url.searchParams.get('fiatCurrency')).toBe('EUR');
  });

  it('passes through whatever wallet address it is given (e.g. a Solana address)', () => {
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'test-live-key-123';

    render(<TransakWidget crypto="SOL" walletAddress="SolWallet11111111" />);

    expect(getIframeSrc().searchParams.get('walletAddress')).toBe('SolWallet11111111');
  });

  it('uses the staging domain/param when the key contains "STAGING"', () => {
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'STAGING-test-key';

    render(<TransakWidget crypto="BTC" walletAddress="0xABC" />);

    const url = getIframeSrc();
    expect(url.origin).toBe('https://global-stg.transak.com');
    expect(url.searchParams.get('environment')).toBe('STAGING');
  });

  it('uses the staging domain/param when NEXT_PUBLIC_TRANSAK_ENVIRONMENT=STAGING, even with a non-staging key', () => {
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'test-live-key-123';
    process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT = 'STAGING';

    render(<TransakWidget crypto="BTC" walletAddress="0xABC" />);

    const url = getIframeSrc();
    expect(url.origin).toBe('https://global-stg.transak.com');
    expect(url.searchParams.get('environment')).toBe('STAGING');
  });

  it('uses the production domain/param for a non-staging key with no environment override', () => {
    process.env.NEXT_PUBLIC_TRANSAK_KEY = 'test-live-key-123';

    render(<TransakWidget crypto="BTC" walletAddress="0xABC" />);

    const url = getIframeSrc();
    expect(url.origin).toBe('https://global.transak.com');
    expect(url.searchParams.get('environment')).toBe('PRODUCTION');
  });
});
