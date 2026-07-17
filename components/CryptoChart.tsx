'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getMarketChart } from '@/app/actions/market';

interface CryptoChartProps {
  cryptoId: string;
  cryptoName: string;
  cryptoSymbol: string;
  currentPrice?: number;
}

export function CryptoChart({ cryptoId, cryptoName, cryptoSymbol, currentPrice }: CryptoChartProps) {
  const [days, setDays] = useState(7);
  
  const fetcher = async () => {
    // Coingecko IDs map for chart
    const idMap: Record<string, string> = {
      'btc': 'bitcoin',
      'eth': 'ethereum',
      'sol': 'solana',
      'usdc': 'usd-coin',
      'avax': 'avalanche-2',
      'link': 'chainlink',
      'pol': 'matic-network',
      'shib': 'shiba-inu',
      'uni': 'uniswap',
    };
    
    const cgId = idMap[cryptoId.toLowerCase()] || cryptoId;
    return getMarketChart(cgId, days);
  };

  const { data, isLoading } = useSWR(`chart-${cryptoId}-${days}`, fetcher, {
    refreshInterval: 60000
  });

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
    <div className="w-full h-full flex flex-col bg-[#252844]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {cryptoName} <span className="text-sm text-gray-400 font-medium">{cryptoSymbol.toUpperCase()}</span>
          </h3>
          {currentPrice && (
            <p className="text-2xl font-extrabold text-white mt-1">
              {currentPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
          )}
        </div>
        
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
          {[1, 7, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${days === d ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {d === 1 ? '24H' : `${d}J`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        {isLoading && !data ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse flex gap-1 items-end h-32">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-2 bg-indigo-500/20 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }} />
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data || []} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickFormatter={(val) => `€${val.toLocaleString()}`}
                width={60}
                tickMargin={5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#818cf8" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
