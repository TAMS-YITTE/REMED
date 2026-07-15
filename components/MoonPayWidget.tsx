'use client';

import { MoonPayBuyWidget, MoonPayProvider } from '@moonpay/moonpay-react';

interface MoonPayWidgetProps {
  crypto?: string;
  walletAddress: string;
}

export function MoonPayWidget({ crypto = 'eth', walletAddress }: MoonPayWidgetProps) {
  const apiKey = process.env.NEXT_PUBLIC_MOONPAY_KEY;

  if (!apiKey || apiKey.includes('votre')) {
    return (
      <div style={{ padding: '1rem', borderRadius: '12px', background: '#FFFBEB', color: '#92400E', fontSize: 14 }}>
        Le paiement par carte/virement n'est pas encore configuré (clé MoonPay manquante). Réessaie plus tard ou choisis une autre méthode.
      </div>
    );
  }

  const isLive = apiKey.startsWith('pk_live_');

  const widgetProps: any = {
    variant: 'embedded',
    baseCurrencyCode: 'eur',
    baseCurrencyAmount: '100',
    defaultCurrencyCode: crypto,
    walletAddress,
    colorCode: '#534AB7',
    language: 'fr',
    visible: true,
  };

  return (
    <div style={{ width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB', position: 'relative', zIndex: 10 }}>
      <MoonPayProvider
        apiKey={apiKey}
        debug={!isLive}
      >
        <MoonPayBuyWidget {...widgetProps} />
      </MoonPayProvider>
    </div>
  );
}
