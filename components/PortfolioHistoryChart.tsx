'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { PortfolioSnapshot } from '@/app/actions/snapshots';
import { Calendar, TrendingUp } from 'lucide-react';

interface PortfolioHistoryChartProps {
  snapshots: PortfolioSnapshot[];
}

export function PortfolioHistoryChart({ snapshots }: PortfolioHistoryChartProps) {
  if (snapshots.length < 2) {
    return (
      <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" /> Évolution du Portefeuille dans le Temps
          </h3>
          <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            Remedly Pro
          </span>
        </div>
        <div className="bg-[#21243b] p-6 rounded-xl border border-white/5 text-center text-xs text-gray-300">
          <Calendar className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-white mb-1">L'historique se construit chaque jour.</p>
          <p className="text-gray-400 max-w-md mx-auto">
            Dès que 2 snapshots quotidiens auront été enregistrés lors du passage du cron, la courbe d'évolution s'affichera ici automatiquement.
          </p>
        </div>
      </div>
    );
  }

  const chartData = snapshots.map((s) => ({
    date: s.snapshot_date,
    valeur: s.total_value_eur,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1c1d30] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{payload[0].payload.date}</p>
          <p className="text-indigo-300 font-bold">
            {payload[0].value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" /> Évolution du Portefeuille dans le Temps
        </h3>
        <span className="text-xs text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30 font-medium">
          {snapshots.length} jour(s) suivis
        </span>
      </div>

      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickMargin={10} minTickGap={30} />
            <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={(val) => `€${val.toLocaleString()}`} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="valeur" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#portfolioColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
