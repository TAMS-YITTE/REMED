'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MarketData {
  fngValue: number;
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
    <div className="relative flex flex-col items-center w-full h-12 mt-1">
      <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible max-w-[100px]">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gaugeGradient)" strokeWidth="8" strokeLinecap="round" />
        
        {/* Indicator dot */}
        <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '50px 50px', transition: 'transform 1s ease-out' }}>
          <circle cx="50" cy="10" r="4" fill="white" className="shadow-md drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
        </g>
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center pb-0.5">
        <span className="text-sm font-bold text-white leading-none">{value}</span>
        <span className="text-[9px] text-gray-400 mt-0.5">{label}</span>
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

  // Mock RSI value for now (neutral)
  const rsiValue = 54;

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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8 items-center">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={`bg-[#2E3152] border border-white/10 rounded-xl h-16 animate-pulse ${i === 1 ? 'col-span-2' : 'col-span-1'}`} />
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6 items-stretch">
      {/* Fear & Greed Card */}
      <div className="col-span-2 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-col justify-center hover:border-indigo-500/30 transition-colors shadow-sm">
        <h3 className="text-[10px] font-semibold text-white/80 flex items-center justify-between mb-0.5 px-1">
          Fear & Greed
          <span className="text-[10px] text-gray-500">›</span>
        </h3>
        <GaugeChart value={data.fngValue} label={translateFng(data.fngClassification)} />
      </div>

      {/* RSI Card */}
      <div className="col-span-1 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-row items-center justify-center gap-2 hover:border-indigo-500/30 transition-colors shadow-sm">
        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-bold shadow-inner flex-shrink-0">
          RSI
        </div>
        <p className="text-sm font-bold tracking-tight text-gray-200">
          {rsiValue}
        </p>
      </div>

      {/* BTC Card */}
      <div className="col-span-1 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-row items-center justify-center gap-2 hover:border-indigo-500/30 transition-colors shadow-sm">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/btc.svg" alt="Bitcoin" className="w-full h-full" />
        </div>
        <p className={`text-sm font-bold tracking-tight ${data.btcChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatChange(data.btcChange)}
        </p>
      </div>

      {/* ETH Card */}
      <div className="col-span-1 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-row items-center justify-center gap-2 hover:border-indigo-500/30 transition-colors shadow-sm">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/eth.svg" alt="Ethereum" className="w-full h-full" />
        </div>
        <p className={`text-sm font-bold tracking-tight ${data.ethChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatChange(data.ethChange)}
        </p>
      </div>

      {/* SOL Card */}
      <div className="col-span-1 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-row items-center justify-center gap-2 hover:border-indigo-500/30 transition-colors shadow-sm">
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-black/40">
          <img src="/sol.svg" alt="Solana" className="w-full h-full" />
        </div>
        <p className={`text-sm font-bold tracking-tight ${data.solChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {formatChange(data.solChange)}
        </p>
      </div>
    </div>
  );
}
