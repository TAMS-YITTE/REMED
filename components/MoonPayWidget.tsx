'use client';

import { MoonPayBuyWidget, MoonPayProvider } from '@moonpay/moonpay-react';
import { useAuth } from '@/hooks/useAuth';

interface MoonPayWidgetProps {
  crypto?: string;
}

export function MoonPayWidget({ crypto = 'btc' }: MoonPayWidgetProps) {
  const { walletAddress } = useAuth();

  if (!walletAddress) return null;

  const isLive = process.env.NEXT_PUBLIC_MOONPAY_KEY?.startsWith('pk_live_');

  const widgetProps: any = {
    variant: 'embedded',
    baseCurrencyCode: 'eur',
    baseCurrencyAmount: '100',
    defaultCurrencyCode: crypto,
    walletAddress: walletAddress,
    colorCode: '#534AB7',
    language: 'fr',
    visible: true,
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <MoonPayProvider 
        apiKey={process.env.NEXT_PUBLIC_MOONPAY_KEY || ''} 
        environment={isLive ? 'production' : 'sandbox'}
      >
        <MoonPayBuyWidget {...widgetProps} />
      </MoonPayProvider>
    </div>
  );
}
