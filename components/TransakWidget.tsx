'use client';

import { useEffect } from 'react';
import { Transak } from '@transak/transak-sdk';
import { useAuth } from '@/hooks/useAuth';

interface TransakWidgetProps {
  crypto?: string;
}

export function TransakWidget({ crypto = 'BTC' }: TransakWidgetProps) {
  const { walletAddress } = useAuth();

  useEffect(() => {
    if (!walletAddress) return;

    const transakConfig: any = {
      apiKey: process.env.NEXT_PUBLIC_TRANSAK_KEY || '',
      environment: 'STAGING',
      defaultCryptoCurrency: crypto,
      walletAddress: walletAddress,
      fiatCurrency: 'EUR',
      language: 'fr',
      themeColor: '534AB7',
      hideMenu: true,
      widgetHeight: '600px',
      widgetWidth: '100%',
    };
    const transak = new Transak(transakConfig);

    transak.init();

    Transak.on(Transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (data: unknown) => {
      console.log('Achat réussi :', data);
      transak.close();
    });

    return () => transak.close();
  }, [walletAddress, crypto]);

  return <div id="transak-widget-container" />;
}
