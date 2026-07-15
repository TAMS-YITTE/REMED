'use client';

import { useAuth } from '@/hooks/useAuth';

interface TransakWidgetProps {
  crypto?: string;
}

export function TransakWidget({ crypto = 'BTC' }: TransakWidgetProps) {
  const { walletAddress } = useAuth();

  if (!walletAddress) return null;

  const apiKey = process.env.NEXT_PUBLIC_TRANSAK_KEY || '';

  if (!apiKey || apiKey.includes('votre')) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[600px] bg-gray-50 border border-gray-200 rounded-xl text-center p-6">
        <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4 text-xl">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Clé Transak manquante</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Pour afficher le module d'achat Transak, veuillez configurer une clé d'API valide dans votre fichier <code className="bg-gray-200 px-1 py-0.5 rounded">.env.local</code>.
        </p>
      </div>
    );
  }

  const isLive = !apiKey.includes('STAGING');
  const baseUrl = isLive ? 'https://global.transak.com' : 'https://global-stg.transak.com';

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
