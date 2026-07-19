'use client';

interface TransakWidgetProps {
  crypto?: string;
  walletAddress: string;
}

export function TransakWidget({ crypto = 'BTC', walletAddress }: TransakWidgetProps) {
  const apiKey = process.env.NEXT_PUBLIC_TRANSAK_KEY || '';
  const isStaging = process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT === 'STAGING' || apiKey.includes('STAGING');

  const baseUrl = isStaging ? 'https://global-stg.transak.com' : 'https://global.transak.com';
  
  // Validation basique de l'adresse pour éviter que Transak plante sur un format invalide
  let finalWalletAddress = walletAddress;
  if (crypto === 'BTC' && walletAddress.startsWith('0x')) {
    finalWalletAddress = ''; // On ne donne pas d'adresse EVM pour du Bitcoin
  } else if (crypto === 'SOL' && walletAddress.startsWith('0x')) {
    finalWalletAddress = ''; // On ne donne pas d'adresse EVM pour du Solana
  }

  const queryParams = new URLSearchParams({
    apiKey,
    environment: isStaging ? 'STAGING' : 'PRODUCTION',
    defaultCryptoCurrency: crypto,
    fiatCurrency: 'EUR',
    themeColor: '534AB7',
    hideMenu: 'true',
    language: 'fr'
  });

  if (finalWalletAddress) {
    queryParams.append('walletAddress', finalWalletAddress);
  }

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
    <div className="flex flex-col items-center justify-center w-full h-[600px] bg-[#2E3152] border border-white/10 rounded-xl text-center p-6">
      <div className="bg-indigo-500/20 p-4 rounded-full text-indigo-400 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Acheter des {crypto}</h3>
      <p className="text-gray-400 text-sm max-w-md mb-8">
        Vous allez être redirigé vers notre partenaire sécurisé Transak pour finaliser votre achat par carte bancaire ou virement.
      </p>
      
      <a 
        href={widgetUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] inline-block"
      >
        Continuer vers Transak
      </a>

      {!finalWalletAddress && (
        <p className="mt-6 text-xs text-amber-400/80 max-w-sm border border-amber-500/20 bg-amber-500/10 p-3 rounded-lg">
          <span className="font-bold block mb-1">Action requise par Transak :</span>
          Transak vous demandera de coller manuellement votre adresse de réception pour le {crypto}.
        </p>
      )}
    </div>
  );
}
