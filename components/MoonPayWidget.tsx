'use client';

import { MoonPayBuyWidget, MoonPayProvider } from '@moonpay/moonpay-react';
import { useAuth } from '@/hooks/useAuth';

interface MoonPayWidgetProps {
  crypto?: string;
}

export function MoonPayWidget({ crypto = 'btc' }: MoonPayWidgetProps) {
  const { walletAddress } = useAuth();

  if (!walletAddress) return null;

  const apiKey = process.env.NEXT_PUBLIC_MOONPAY_KEY;

  if (!apiKey || apiKey.includes('votre')) {
    return (
      <div style={{ padding: '1rem', borderRadius: '12px', background: '#FFFBEB', color: '#92400E', fontSize: 14 }}>
        Le paiement par carte/virement n'est pas encore configuré (clé MoonPay manquante). Réessaie plus tard ou choisis une autre méthode.
      </div>
    );
  }

  const isLive = apiKey.startsWith('pk_live_');

  // Ne passer l'adresse que si c'est un jeton EVM (Ethereum, Polygon, etc.)
  // car Privy génère un wallet EVM (0x...)
  const isEVM = ['eth', 'usdc', 'usdt', 'matic', 'pol'].includes(crypto.toLowerCase());

  const widgetProps: any = {
    variant: 'embedded',
    baseCurrencyCode: 'eur',
    baseCurrencyAmount: '100',
    defaultCurrencyCode: crypto,
    colorCode: '#534AB7',
    language: 'fr',
    visible: true,
  };

  if (isEVM) {
    widgetProps.walletAddress = walletAddress;
  }

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <MoonPayProvider 
        apiKey={apiKey}
        debug={!isLive}
      >
        <MoonPayBuyWidget {...widgetProps} />
      </MoonPayProvider>
    </div>
  );
}
