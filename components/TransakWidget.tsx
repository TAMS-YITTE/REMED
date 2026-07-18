'use client';

import { useEffect, useState } from 'react';
import { getTransakWidgetUrl } from '@/app/actions/transak';

interface TransakWidgetProps {
  crypto?: string;
  walletAddress: string;
}

export function TransakWidget({ crypto = 'BTC', walletAddress }: TransakWidgetProps) {
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    getTransakWidgetUrl({ walletAddress, crypto }).then((url) => {
      if (cancelled) return;
      if (url) {
        setWidgetUrl(url);
        setStatus('ready');
      } else {
        setStatus('error');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [walletAddress, crypto]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[600px] bg-gray-50 border border-gray-200 rounded-xl text-center p-6">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-sm">Préparation du paiement sécurisé...</p>
      </div>
    );
  }

  if (status === 'error' || !widgetUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[600px] bg-gray-50 border border-gray-200 rounded-xl text-center p-6">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 text-xl">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Transak momentanément indisponible</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Essayez de recharger la page, ou basculez sur MoonPay ci-dessous.
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
          rel="noopener"
          className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          La fenêtre ne s'affiche pas ? Cliquez ici pour ouvrir Transak
        </a>
      </div>
    </div>
  );
}
