'use client';

import { useEffect, useState } from 'react';
import { Gauge, TrendingUp, Compass, AlertCircle } from 'lucide-react';

interface FearAndGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

export function FearAndGreedGauge() {
  const [data, setData] = useState<FearAndGreedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.alternative.me/fng/?limit=1')
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data?.[0]) {
          const item = resData.data[0];
          setData({
            value: parseInt(item.value, 10),
            classification: translateClassification(item.value_classification),
            timestamp: item.timestamp,
          });
        }
      })
      .catch((err) => console.error('Erreur Fear & Greed API:', err))
      .finally(() => setLoading(false));
  }, []);

  const translateClassification = (cls: string): string => {
    switch (cls.toLowerCase()) {
      case 'extreme fear':
        return 'Extrême Peur 😨';
      case 'fear':
        return 'Peur 😟';
      case 'neutral':
        return 'Neutre 😐';
      case 'greed':
        return 'Avidité 🤑';
      case 'extreme greed':
        return 'Extrême Avidité 🚀';
      default:
        return cls;
    }
  };

  const getColor = (val: number) => {
    if (val <= 25) return 'from-red-600 to-orange-600 text-red-400 border-red-500/30';
    if (val <= 45) return 'from-orange-500 to-yellow-500 text-orange-400 border-orange-500/30';
    if (val <= 55) return 'from-yellow-500 to-emerald-500 text-yellow-300 border-yellow-500/30';
    if (val <= 75) return 'from-emerald-500 to-teal-500 text-emerald-400 border-emerald-500/30';
    return 'from-teal-500 to-indigo-500 text-emerald-300 border-emerald-400/30';
  };

  if (loading) {
    return (
      <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-6 flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  if (!data) return null;

  const percentage = data.value;
  const gradientClass = getColor(data.value);

  return (
    <div className="bg-[#2d3152] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-lg">Crypto Fear & Greed Index</h3>
        </div>
        <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
          En direct du marché
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Jauge Visuelle */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#21243b] rounded-xl border border-white/5">
          <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-white">{data.value}</span>
              <span className="text-[10px] text-gray-400 uppercase font-semibold">/ 100</span>
            </div>
          </div>
          <p className="mt-3 text-sm font-bold text-indigo-300">{data.classification}</p>
        </div>

        {/* Conseil / Analyse d'Investisseur */}
        <div className="space-y-3">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-indigo-200 leading-relaxed">
            💡 <strong>Interprétation de l'indicateur :</strong>
            {data.value <= 35 && (
              <span> La peur extrême indique que les investisseurs sont trop inquiets. Cela peut être une <strong>opportunité d'achat d'accumulation</strong>.</span>
            )}
            {data.value > 35 && data.value <= 65 && (
              <span> Le marché est dans une phase de neutralité ou d'équilibre relatif. Les investisseurs attendent une tendance claire.</span>
            )}
            {data.value > 65 && (
              <span> L'avidité est élevée. Les investisseurs deviennent euphoriques, ce qui peut signaler une correction à court terme. <strong>Prudence sur les achats d'impulsion</strong>.</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400" /> Mis à jour quotidiennement basé sur la volatilité, le volume et les réseaux sociaux.
          </p>
        </div>
      </div>
    </div>
  );
}
