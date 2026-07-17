'use client';

import { useState, useEffect } from 'react';

interface MarketData {
  fngValue: number;
  fngClassification: string;
  btcChange: number;
  ethChange: number;
  isLoading: boolean;
  error: boolean;
}

export function MarketTrends() {
  const [data, setData] = useState<MarketData>({
    fngValue: 50,
    fngClassification: 'Neutral',
    btcChange: 0,
    ethChange: 0,
    isLoading: true,
    error: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [fngRes, cgRes] = await Promise.all([
          fetch('https://api.alternative.me/fng/'),
          fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=eur&include_24hr_change=true')
        ]);

        if (!fngRes.ok || !cgRes.ok) throw new Error('Failed to fetch');

        const fngData = await fngRes.json();
        const cgData = await cgRes.json();

        setData({
          fngValue: parseInt(fngData.data[0].value, 10),
          fngClassification: fngData.data[0].value_classification,
          btcChange: cgData.bitcoin?.eur_24h_change || 0,
          ethChange: cgData.ethereum?.eur_24h_change || 0,
          isLoading: false,
          error: false,
        });
      } catch (err) {
        console.error('Error fetching market trends:', err);
        setData(prev => ({ ...prev, isLoading: false, error: true }));
      }
    }

    fetchData();
  }, []);

  if (data.isLoading) {
    return (
      <div className="bg-[#2E3152] border border-white/10 rounded-2xl p-6 shadow-lg mb-8 animate-pulse flex items-center justify-center min-h-[120px]">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (data.error) {
    return null; // Silently fail and hide widget if API is down
  }

  // Calculate visual properties for Fear & Greed
  const getFngColor = (val: number) => {
    if (val <= 25) return 'text-red-400';
    if (val <= 45) return 'text-orange-400';
    if (val <= 55) return 'text-yellow-400';
    if (val <= 75) return 'text-green-400';
    return 'text-emerald-400';
  };

  const getFngBg = (val: number) => {
    if (val <= 25) return 'bg-red-400/20 border-red-400/30';
    if (val <= 45) return 'bg-orange-400/20 border-orange-400/30';
    if (val <= 55) return 'bg-yellow-400/20 border-yellow-400/30';
    if (val <= 75) return 'bg-green-400/20 border-green-400/30';
    return 'bg-emerald-400/20 border-emerald-400/30';
  };

  const translateFng = (enClass: string) => {
    const map: Record<string, string> = {
      'Extreme Fear': 'Peur Extrême',
      'Fear': 'Peur',
      'Neutral': 'Neutre',
      'Greed': 'Avidité',
      'Extreme Greed': 'Avidité Extrême'
    };
    return map[enClass] || enClass;
  };

  const formatChange = (val: number) => {
    const prefix = val > 0 ? '+' : '';
    return `${prefix}${val.toFixed(2)}%`;
  };

  const getSummaryText = (val: number) => {
    if (val <= 25) return "Le marché panique, c'est souvent le moment des bonnes affaires.";
    if (val <= 45) return "Les investisseurs sont craintifs. Restez méthodique.";
    if (val <= 55) return "Marché neutre. Bonne période pour de l'achat programmé (DCA).";
    if (val <= 75) return "L'optimisme règne. Les prix montent, restez prudent.";
    return "Euphorie totale sur le marché. Attention aux corrections.";
  };

  return (
    <div className="bg-[#2E3152] border border-white/10 rounded-2xl p-6 shadow-lg mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tendance du Marché</h3>
        <div className="flex items-center gap-4">
          <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 ${getFngBg(data.fngValue)} ${getFngColor(data.fngValue)} shadow-inner bg-[#252844] flex-shrink-0`}>
            <span className="text-2xl font-bold">{data.fngValue}</span>
          </div>
          <div>
            <p className={`text-lg font-bold ${getFngColor(data.fngValue)}`}>{translateFng(data.fngClassification)}</p>
            <p className="text-sm text-gray-300 mt-1 max-w-sm leading-relaxed">{getSummaryText(data.fngValue)}</p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto flex flex-row md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
        <div className="bg-[#252844] rounded-xl p-3 px-4 flex items-center gap-3 border border-white/5 min-w-[140px]">
          <div className="w-8 h-8 rounded-full bg-[#f7931a]/20 flex items-center justify-center text-[#f7931a] text-xs font-bold">₿</div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Bitcoin</p>
            <p className={`text-sm font-bold ${data.btcChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChange(data.btcChange)}
            </p>
          </div>
        </div>
        <div className="bg-[#252844] rounded-xl p-3 px-4 flex items-center gap-3 border border-white/5 min-w-[140px]">
          <div className="w-8 h-8 rounded-full bg-[#627eea]/20 flex items-center justify-center text-[#627eea] text-xs font-bold">Ξ</div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Ethereum</p>
            <p className={`text-sm font-bold ${data.ethChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChange(data.ethChange)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
