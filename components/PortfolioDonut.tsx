import React from 'react';

export interface TokenSlice {
  symbol: string;
  value: number;
}

interface PortfolioDonutProps {
  ethValue: number;
  solValue: number;
  btcValue: number;
  // Chaque jeton détenu (LINK, USDC...) apparaît sous son propre nom :
  // un poste "Jetons ERC-20" ne disait pas à l'utilisateur ce qu'il détient.
  tokens?: TokenSlice[];
}

// Couleurs des jetons, dans l'ordre d'affichage. Distinctes de celles
// d'ETH / SOL / BTC pour rester lisibles côte à côte.
const TOKEN_COLORS = ['#ec4899', '#06b6d4', '#a855f7', '#84cc16', '#f97316'];
const EMPTY_COLOR = '#374151'; // gray-700

export function PortfolioDonut({ ethValue, solValue, btcValue, tokens = [] }: PortfolioDonutProps) {
  const segments = [
    { label: 'Ethereum (ETH)', value: ethValue, color: '#6366f1' },
    { label: 'Solana (SOL)', value: solValue, color: '#10b981' },
    { label: 'Bitcoin (BTC)', value: btcValue, color: '#f59e0b' },
    ...tokens
      .filter((t) => t.value > 0)
      .map((t, i) => ({
        label: t.symbol,
        value: t.value,
        color: TOKEN_COLORS[i % TOKEN_COLORS.length],
      })),
  ];

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const isEmpty = total === 0;

  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Chaque arc démarre là où le précédent s'arrête.
  let consumed = 0;
  const arcs = segments.map((s) => {
    const percent = isEmpty ? 0 : s.value / total;
    const arc = {
      ...s,
      percent,
      dasharray: `${percent * circumference} ${circumference}`,
      offset: -(consumed * circumference),
    };
    consumed += percent;
    return arc;
  });

  return (
    <div className="flex items-center gap-8 bg-[#2E3152] border border-white/10 rounded-2xl p-6 shadow-lg">
      <div className="relative w-40 h-40 shrink-0">
        <svg width={size} height={size} className="-rotate-90 transform">
          {isEmpty ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={EMPTY_COLOR}
              strokeWidth={strokeWidth}
            />
          ) : (
            arcs
              .filter((a) => a.percent > 0)
              .map((a) => (
                <circle
                  key={a.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={a.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={a.dasharray}
                  strokeDashoffset={a.offset}
                />
              ))
          )}
        </svg>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Répartition</h3>
        <div className="flex flex-col gap-3">
          {arcs
            .filter((a) => a.value > 0 || ['Ethereum (ETH)', 'Solana (SOL)', 'Bitcoin (BTC)'].includes(a.label))
            .map((a) => (
              <LegendRow key={a.label} label={a.label} value={a.value} total={total} color={a.color} />
            ))}
        </div>
      </div>
    </div>
  );
}

function LegendRow({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
        <span className="text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-white">{value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
        <span className="text-gray-400 w-8 text-right">{percent}%</span>
      </div>
    </div>
  );
}
