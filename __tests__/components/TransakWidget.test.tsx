import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransakWidget } from '@/components/TransakWidget';
import { getTransakWidgetUrl } from '@/app/actions/transak';

jest.mock('@/app/actions/transak', () => ({
  getTransakWidgetUrl: jest.fn(),
}));

const mockedGetTransakWidgetUrl = getTransakWidgetUrl as jest.Mock;

describe('TransakWidget', () => {
  beforeEach(() => {
    mockedGetTransakWidgetUrl.mockReset();
  });

  it('shows a loading state while the widget URL is being fetched', () => {
    mockedGetTransakWidgetUrl.mockReturnValue(new Promise(() => {})); // never resolves

    render(<TransakWidget crypto="ETH" walletAddress="0xABC" />);

    expect(screen.getByText('Préparation du paiement sécurisé...')).toBeInTheDocument();
    expect(document.querySelector('iframe')).not.toBeInTheDocument();
  });

  it('renders the iframe with the URL returned by the server action once ready', async () => {
    mockedGetTransakWidgetUrl.mockResolvedValue('https://global.transak.com?sessionId=abc123');

    render(<TransakWidget crypto="ETH" walletAddress="0xABC" />);

    // Wait for the loading state to resolve into the ready state.
    await screen.findByText('La fenêtre ne s\'affiche pas ? Cliquez ici pour ouvrir Transak');
    const src = document.querySelector('iframe')?.getAttribute('src');
    expect(src).toBe('https://global.transak.com?sessionId=abc123');

    expect(mockedGetTransakWidgetUrl).toHaveBeenCalledWith({ walletAddress: '0xABC', crypto: 'ETH' });
  });

  it('shows an error state and no iframe when the server action returns null', async () => {
    mockedGetTransakWidgetUrl.mockResolvedValue(null);

    render(<TransakWidget crypto="BTC" walletAddress="0xABC" />);

    await screen.findByText('Transak momentanément indisponible');
    expect(document.querySelector('iframe')).not.toBeInTheDocument();
  });
});
