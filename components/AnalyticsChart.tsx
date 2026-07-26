'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getMarketChart } from '@/app/actions/market';

// Mapping symbole -> id CoinGecko (mêmes ids que CryptoChart / prices).
const CG_ID: Record<string, string> = {
  btc: 'bitcoin', eth: 'ethereum', sol: 'solana', usdc: 'usd-coin',
  avax: 'avalanche-2', link: 'chainlink', pol: 'matic-network',
  shib: 'shiba-inu', uni: 'uniswap',
};

const PERIODS = [
  { days: 30, label: '1M' },
  { days: 180, label: '6M' },
  { days: 365, label: '1A' },
];

interface AnalyticsChartProps {
  cryptoId: string;
  cryptoName: string;
}

export function AnalyticsChart({ cryptoId, cryptoName }: AnalyticsChartProps) {
  const [days, setDays] = useState(30);

  const fetcher = () => getMarketChart(CG_ID[cryptoId.toLowerCase()] || cryptoId, days);
  const { data, isLoading } = useSWR(`analytics-${cryptoId}-${days}`, fetcher, { refreshInterval: 300000 });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1c1d30] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{payload[0].payload.time}</p>
          <p className="text-white font-bold">
            {payload[0].value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-[#2d3152] border border-white/10 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white">{cryptoName}</h3>
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${days === p.days ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[260px]">
        {isLoading && !data ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data || []} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickMargin={10} minTickGap={40} />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={(val) => `€${val.toLocaleString()}`} width={60} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="price" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#analyticsColor)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
