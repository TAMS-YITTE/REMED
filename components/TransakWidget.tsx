'use client';

interface TransakWidgetProps {
  crypto?: string;
  walletAddress: string;
}

export function TransakWidget({ crypto = 'BTC', walletAddress }: TransakWidgetProps) {
  const apiKey = process.env.NEXT_PUBLIC_TRANSAK_KEY || '';
  const isStaging = process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT === 'STAGING' || apiKey.includes('STAGING');

  const baseUrl = isStaging ? 'https://global-stg.transak.com' : 'https://global.transak.com';
  
  const queryParams = new URLSearchParams({
    apiKey,
    environment: isStaging ? 'STAGING' : 'PRODUCTION',
    walletAddress,
    defaultCryptoCurrency: crypto,
    fiatCurrency: 'EUR',
    themeColor: '534AB7',
    hideMenu: 'true',
    language: 'fr'
  });

  const widgetUrl = `${baseUrl}?${queryParams.toString()}`;

  if (!apiKey || apiKey.includes('votre_')) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[600px] bg-gray-50 border border-gray-200 rounded-xl text-center p-6">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 text-xl">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Clé Transak manquante</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Veuillez configurer NEXT_PUBLIC_TRANSAK_KEY dans votre fichier d'environnement.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div style={{ width: '100%', height: '600px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
        <iframe
          src={widgetUrl}
          allow="camera;microphone;payment"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
      <div className="text-center">
        <a 
          href={widgetUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          La fenêtre ne s'affiche pas ? Cliquez ici pour ouvrir Transak dans un nouvel onglet
        </a>
      </div>
    </div>
  );
}
