import React from 'react';

interface PortfolioDonutProps {
  ethValue: number;
  solValue: number;
  btcValue: number;
}

export function PortfolioDonut({ ethValue, solValue, btcValue }: PortfolioDonutProps) {
  const total = ethValue + solValue + btcValue;
  const isEmpty = total === 0;

  // Couleurs : ETH (Violet/Bleu), SOL (Vert), BTC (Orange), Vide (Gris)
  const colors = {
    eth: '#6366f1', // indigo-500
    sol: '#10b981', // emerald-500
    btc: '#f59e0b', // amber-500
    empty: '#374151' // gray-700
  };

  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calcul des pourcentages et des offsets pour SVG
  const ethPercent = isEmpty ? 0 : ethValue / total;
  const solPercent = isEmpty ? 0 : solValue / total;
  const btcPercent = isEmpty ? 0 : btcValue / total;

  const ethStrokeDasharray = `${ethPercent * circumference} ${circumference}`;
  const solStrokeDasharray = `${solPercent * circumference} ${circumference}`;
  const btcStrokeDasharray = `${btcPercent * circumference} ${circumference}`;

  const ethOffset = 0;
  const solOffset = - (ethPercent * circumference);
  const btcOffset = solOffset - (solPercent * circumference);

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
              stroke={colors.empty}
              strokeWidth={strokeWidth}
            />
          ) : (
            <>
              {ethPercent > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={colors.eth}
                  strokeWidth={strokeWidth}
                  strokeDasharray={ethStrokeDasharray}
                  strokeDashoffset={ethOffset}
                />
              )}
              {solPercent > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={colors.sol}
                  strokeWidth={strokeWidth}
                  strokeDasharray={solStrokeDasharray}
                  strokeDashoffset={solOffset}
                />
              )}
              {btcPercent > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={colors.btc}
                  strokeWidth={strokeWidth}
                  strokeDasharray={btcStrokeDasharray}
                  strokeDashoffset={btcOffset}
                />
              )}
            </>
          )}
        </svg>
      </div>
      
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Répartition</h3>
        <div className="flex flex-col gap-3">
          <LegendRow label="Ethereum (ETH)" value={ethValue} total={total} color="bg-indigo-500" />
          <LegendRow label="Solana (SOL)" value={solValue} total={total} color="bg-emerald-500" />
          <LegendRow label="Bitcoin (BTC)" value={btcValue} total={total} color="bg-amber-500" />
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
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-white">{value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
        <span className="text-gray-400 w-8 text-right">{percent}%</span>
      </div>
    </div>
  );
}
