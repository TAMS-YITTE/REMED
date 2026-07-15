'use client';

import { useState } from 'react';
import { MoonPayWidget } from './MoonPayWidget';
import { TransakWidget } from './TransakWidget';

interface BuyWidgetProps {
  crypto?: string;
}

export function BuyWidget({ crypto = 'btc' }: BuyWidgetProps) {
  const [provider, setProvider] = useState<'moonpay' | 'transak'>('transak');

  return (
    <div>
      {provider === 'moonpay' ? (
        <MoonPayWidget crypto={crypto.toLowerCase()} />
      ) : (
        <TransakWidget crypto={crypto.toUpperCase()} />
      )}

      {/* Lien discret pour basculer si problème */}
      <p
        style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 12, cursor: 'pointer' }}
        onClick={() => setProvider(p => p === 'moonpay' ? 'transak' : 'moonpay')}
      >
        Problème avec le paiement ? Essaie une autre méthode
      </p>
    </div>
  );
}
