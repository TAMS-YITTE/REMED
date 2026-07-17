'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MarketData {
  fngValue: number;
  fngClassification: string;
  fngClassification: string;
  btcChange: number;
  ethChange: number;
  solChange: number;
  isLoading: boolean;
  error: boolean;
}

const GaugeChart = ({ value, label }: { value: number, label: string }) => {
  // value from 0 to 100
  // rotation from -90 to +90
  const rotation = (value / 100) * 180 - 90;

  return (
    <div className="relative flex flex-col items-center w-full h-24 mt-2">
      <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible max-w-[160px]">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gaugeGradient)" strokeWidth="6" strokeLinecap="round" />
        
        {/* Indicator dot */}
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50px 50px', transition: 'transform 1s ease-out' }}>
          <circle cx="50" cy="10" r="4" fill="white" className="shadow-md drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
        </g>
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center pb-2">
        <span className="text-2xl font-bold text-white leading-none">{value}</span>
        <span className="text-xs text-gray-400 mt-1">{label}</span>
      </div>
    </div>
  )
}

export function MarketTrends() {
  const [data, setData] = useState<MarketData>({
    fngValue: 50,
    fngClassification: 'Neutral',
    btcChange: 0,
    ethChange: 0,
    solChange: 0,
    isLoading: true,
    error: false,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [fngRes, cgRes] = await Promise.all([
          fetch('https://api.alternative.me/fng/'),
          fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=eur&include_24hr_change=true')
        ]);

        if (!fngRes.ok || !cgRes.ok) throw new Error('Failed to fetch');

        const fngData = await fngRes.json();
        const cgData = await cgRes.json();

        setData({
          fngValue: parseInt(fngData.data[0].value, 10),
          fngClassification: fngData.data[0].value_classification,
          btcChange: cgData.bitcoin?.eur_24h_change || 0,
          ethChange: cgData.ethereum?.eur_24h_change || 0,
          solChange: cgData.solana?.eur_24h_change || 0,
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#2E3152] border border-white/10 rounded-2xl h-36 animate-pulse" />
        ))}
      </div>
    );
  }

  if (data.error) {
    return null; // Silently fail and hide widget if API is down
  }

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Fear & Greed Card */}
      <div className="col-span-2 md:col-span-1 bg-[#2E3152] border border-white/10 rounded-2xl p-4 flex flex-col hover:border-indigo-500/30 transition-colors shadow-lg">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center justify-between">
          Fear & Greed
          <span className="text-xs text-gray-500">›</span>
        </h3>
        <GaugeChart value={data.fngValue} label={translateFng(data.fngClassification)} />
      </div>

      {/* BTC Card */}
      <div className="col-span-1 bg-[#2E3152] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-indigo-500/30 transition-colors shadow-lg">
        <div className="w-12 h-12 rounded-full bg-[#f7931a]/20 flex items-center justify-center text-[#f7931a] text-2xl font-bold mb-3 shadow-inner">₿</div>
        <p className={`text-xl font-bold tracking-tight ${data.btcChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatChange(data.btcChange)}
        </p>
      </div>

      {/* ETH Card */}
      <div className="col-span-1 bg-[#2E3152] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-indigo-500/30 transition-colors shadow-lg">
        <div className="w-12 h-12 rounded-full bg-[#627eea]/20 flex items-center justify-center text-[#627eea] text-2xl font-bold mb-3 shadow-inner">Ξ</div>
        <p className={`text-xl font-bold tracking-tight ${data.ethChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatChange(data.ethChange)}
        </p>
      </div>

      {/* SOL Card */}
      <div className="col-span-2 sm:col-span-1 md:col-span-1 bg-[#2E3152] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center hover:border-indigo-500/30 transition-colors shadow-lg">
        <div className="w-12 h-12 rounded-full bg-[#14F195]/20 flex items-center justify-center text-[#14F195] text-xs font-bold mb-3 shadow-inner relative overflow-hidden">
          <img src="/sol.svg" alt="Solana" className="w-6 h-6" />
        </div>
        <p className={`text-xl font-bold tracking-tight ${data.solChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatChange(data.solChange)}
        </p>
      </div>
    </div>
  );
}
