'use client';

import { useAuth } from '@/hooks/useAuth';

interface TransakWidgetProps {
  crypto?: string;
}

export function TransakWidget({ crypto = 'BTC' }: TransakWidgetProps) {
  const { walletAddress } = useAuth();

  if (!walletAddress) return null;

  const isLive = process.env.NEXT_PUBLIC_TRANSAK_KEY && !process.env.NEXT_PUBLIC_TRANSAK_KEY.includes('STAGING');
  const baseUrl = isLive ? 'https://global.transak.com' : 'https://global-stg.transak.com';
  const apiKey = process.env.NEXT_PUBLIC_TRANSAK_KEY || '';
  
  // Construction de l'URL avec les paramètres recommandés
  const queryParams = new URLSearchParams({
    apiKey,
    walletAddress,
    defaultCryptoCurrency: crypto,
    fiatCurrency: 'EUR',
    themeColor: '534AB7',
    hideMenu: 'true',
    language: 'fr'
  });

  const src = `${baseUrl}?${queryParams.toString()}`;

  return (
    <div style={{ width: '100%', height: '600px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
      <iframe
        src={src}
        allow="camera;microphone;payment"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
}
