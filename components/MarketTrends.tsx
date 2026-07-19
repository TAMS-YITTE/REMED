'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MarketData {
  fngValue: number | null;
  fngClassification: string | null;
  btcChange: number | null;
  ethChange: number | null;
  solChange: number | null;
  rsiValue: number | null;
  altcoinSeason: number | null;
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

import useSWR from 'swr';
import { getMarketTrendsData } from '@/app/actions/market';

export function MarketTrends() {
  const fetcher = async () => {
    const res = await getMarketTrendsData();
    if (!res) throw new Error("Failed to fetch market trends");
    return res;
  };

  const { data, error, isLoading } = useSWR<MarketData | null>('marketTrends', fetcher, {
    refreshInterval: 60000, // Refresh every 60s
  });

  if (isLoading && !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8 items-center">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={`bg-[#2E3152] border border-white/10 rounded-xl h-16 animate-pulse col-span-1`} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center bg-[#2E3152] border border-white/10 rounded-xl p-4 mb-8 text-sm text-gray-400">
        Données de marché momentanément indisponibles
      </div>
    );
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

  const formatChange = (val: number | null) => {
    if (val === null) return '';
    const prefix = val > 0 ? '+' : '';
    return `${prefix}${val.toFixed(2)}%`;
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 items-stretch w-full"
    >
      {/* Fear & Greed Card */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="col-span-1 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-col justify-center hover:border-indigo-500/30 transition-colors shadow-sm">
        <h3 className="text-[10px] font-semibold text-white/80 flex items-center justify-between mb-0.5 px-1">
          Fear & Greed
          <span className="text-[10px] text-gray-500">›</span>
        </h3>
        {data.fngValue !== null ? (
          <GaugeChart value={data.fngValue} label={translateFng(data.fngClassification || '')} />
        ) : (
          <span className="text-xs text-gray-500 text-center mt-2">Indisponible</span>
        )}
      </motion.div>

      {/* Altcoin Season Card */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="col-span-1 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-col justify-center hover:border-indigo-500/30 transition-colors shadow-sm">
        <h3 className="text-[10px] font-semibold text-white/80 flex items-center justify-between mb-0.5 px-1">
          Altcoin Season
          <span className="text-[10px] text-gray-500">›</span>
        </h3>
        {data.altcoinSeason !== null ? (
          <GaugeChart value={data.altcoinSeason} label={data.altcoinSeason >= 75 ? 'Altcoin Season' : data.altcoinSeason <= 25 ? 'Bitcoin Season' : 'Neutre'} />
        ) : (
          <span className="text-xs text-gray-500 text-center mt-2">Indisponible</span>
        )}
      </motion.div>

      {/* RSI Card */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="col-span-1 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-row items-center justify-center gap-2 hover:border-indigo-500/30 transition-colors shadow-sm">
        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-[10px] font-bold shadow-inner flex-shrink-0">
          RSI
        </div>
        <div className="flex flex-col">
          {data.rsiValue !== null ? (
            <>
              <span className="text-lg font-extrabold text-white leading-none">{data.rsiValue}</span>
              <span className="text-[9px] text-gray-400 font-medium">
                {data.rsiValue > 70 ? 'Suracheté' : data.rsiValue < 30 ? 'Survendu' : 'Neutre'}
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-500">Indisponible</span>
          )}
        </div>
      </motion.div>

      {/* BTC Change */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="col-span-1 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-col justify-center hover:border-indigo-500/30 transition-colors shadow-sm">
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <img src="/btc.svg" alt="BTC" className="w-4 h-4 rounded-full" />
          <span className="text-[10px] font-semibold text-white/80">Bitcoin</span>
        </div>
        <div className="flex items-end justify-between px-1">
          {data.btcChange !== null ? (
            <span className={`text-sm font-bold ${data.btcChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChange(data.btcChange)}
            </span>
          ) : (
            <span className="text-xs text-gray-500">Indisponible</span>
          )}
          <span className="text-[8px] text-gray-500 mb-0.5">24h</span>
        </div>
      </motion.div>

      {/* ETH Change */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="col-span-1 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-col justify-center hover:border-indigo-500/30 transition-colors shadow-sm">
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <img src="/eth.svg" alt="ETH" className="w-4 h-4 rounded-full bg-white/90 p-0.5" />
          <span className="text-[10px] font-semibold text-white/80">Ethereum</span>
        </div>
        <div className="flex items-end justify-between px-1">
          {data.ethChange !== null ? (
            <span className={`text-sm font-bold ${data.ethChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChange(data.ethChange)}
            </span>
          ) : (
            <span className="text-xs text-gray-500">Indisponible</span>
          )}
          <span className="text-[8px] text-gray-500 mb-0.5">24h</span>
        </div>
      </motion.div>

      {/* SOL Change */}
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="col-span-1 sm:col-span-1 md:col-span-1 bg-[#2E3152] border border-white/10 rounded-xl p-2 flex flex-col justify-center hover:border-indigo-500/30 transition-colors shadow-sm">
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <img src="/sol.svg" alt="SOL" className="w-4 h-4 rounded-full" />
          <span className="text-[10px] font-semibold text-white/80">Solana</span>
        </div>
        <div className="flex items-end justify-between px-1">
          {data.solChange !== null ? (
            <span className={`text-sm font-bold ${data.solChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChange(data.solChange)}
            </span>
          ) : (
            <span className="text-xs text-gray-500">Indisponible</span>
          )}
          <span className="text-[8px] text-gray-500 mb-0.5">24h</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
