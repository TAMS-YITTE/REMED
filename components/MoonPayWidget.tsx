'use client';

import { MoonPayBuyWidget } from '@moonpay/moonpay-react';
import { useAuth } from '@/hooks/useAuth';

interface MoonPayWidgetProps {
  crypto?: string;
}

export function MoonPayWidget({ crypto = 'btc' }: MoonPayWidgetProps) {
  const { walletAddress } = useAuth();

  if (!walletAddress) return null;

  const widgetProps: any = {
    apiKey: process.env.NEXT_PUBLIC_MOONPAY_KEY || '',
    theme: "light",
    baseCurrencyCode: "eur",
    baseCurrencyAmount: "100",
    currencyCode: crypto,
    walletAddress: walletAddress,
    colorCode: "#534AB7",
    language: "fr",
    onLogin: async () => {},
    visible: true,
  };

  return <MoonPayBuyWidget {...widgetProps} />;
}
