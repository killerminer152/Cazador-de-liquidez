import React, { useState } from 'react';
import { LiquidityCluster, MarketData, Timeframe } from '../types/trading';
import { TrendingUp, TrendingDown, Shield, Eye, Flame, Layers, DollarSign } from 'lucide-react';

interface AssetLiquidationPanelProps {
  market: MarketData;
  timeframe: Timeframe;
  threshold: number;
  highlightedClusterId?: string;
  isMirrorActive: boolean;
}

export const AssetLiquidationPanel: React.FC<AssetLiquidationPanelProps> = ({
  market,
  timeframe,
  threshold,
  highlightedClusterId,
  isMirrorActive,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<LiquidityCluster | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual');

  const {
    displaySymbol,
    currentPrice,
    priceChangePercent24h,
    fundingRate,
    openInterestUsdt,
    longShortRatio,
    clusters,
  } = market;

  const isBtc = market.symbol.includes('BTC');
  const priceFormatter = (p: number) =>
    isBtc
      ? `$${p.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`
      : `$${p.toFixed(6)}`;

  const volFormatter = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
    return `$${v.toFixed(0)}`;
  };

  // Filter clusters according to timeframe and user threshold (e.g. 0.63)
  const filteredClusters = clusters.filter(c => {
    // Dynamic density adjusted for macro persistence in 24H and 48H
    const tfDensity =
      timeframe === '12H'
        ? c.density
        : Math.min(1.0, c.density * (c.persistence[timeframe] / c.persistence['12H'] * 0.85));
    return tfDensity >= threshold;
  });

  const shortLiqPool = filteredClusters
    .filter(c => c.side === 'SHORT_LIQ')
    .reduce((sum, c) => sum + c.persistence[timeframe], 0);

  const longLiqPool = filteredClusters
    .filter(c => c.side === 'LONG_LIQ')
    .reduce((sum, c) => sum + c.persistence[timeframe], 0);

  // Separate into shorts (above) and longs (below) sorted by distance from current price
  const shortClusters = filteredClusters
    .filter(c => c.side === 'SHORT_LIQ')
    .sort((a, b) => b.price - a.price); // Highest price at top

  const longClusters = filteredClusters
    .filter(c => c.side === 'LONG_LIQ')
    .sort((a, b) => b.price - a.price); // Highest price at top (closest to current)

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
      {/* Header Bar */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              isBtc
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isBtc ? '₿' : '🐸'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 text-sm">{displaySymbol}</span>
              <span className="text-[11px] font-mono text-slate-500">Perp</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-white text-base">
                {priceFormatter(currentPrice)}
              </span>
              <span
                className={`font-mono text-xs font-semibold ${
                  priceChangePercent24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {priceChangePercent24h >= 0 ? '+' : ''}
                {priceChangePercent24h.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Micro Metrics */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px]">Funding (8h)</span>
            <span className={fundingRate >= 0 ? 'text-amber-300' : 'text-indigo-300'}>
              {(fundingRate * 100).toFixed(4)}%
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Open Interest</span>
            <span className="text-slate-200">{volFormatter(openInterestUsdt)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">L/S Ratio</span>
            <span className="text-slate-200">{longShortRatio.toFixed(2)}</span>
          </div>

          <div className="inline-flex p-0.5 bg-slate-900 border border-slate-800 rounded-md">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                viewMode === 'visual' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mapa
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                viewMode === 'table' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tabla ({filteredClusters.length})
            </button>
          </div>
        </div>
      </div>

      {/* Liquidity Pool Summary Bar */}
      <div className="px-3.5 py-2 bg-slate-950/30 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-rose-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Pool Short Liq: <strong>{volFormatter(shortLiqPool)}</strong></span>
        </div>
        <div className="text-[11px] text-slate-500">
          Filtro: <span className="text-amber-400 font-bold">≥ {threshold.toFixed(2)}</span> ({filteredClusters.length} nodos activos)
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Pool Long Liq: <strong>{volFormatter(longLiqPool)}</strong></span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3.5 flex-1 overflow-y-auto min-h-[380px]">
        {viewMode === 'visual' ? (
          <div className="space-y-4">
            {/* 1. SHORT LIQUIDATIONS (Above Current Price - Buy Stops) */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <Flame className="w-3 h-3 text-rose-400" />
                  Muros de Stops para Shorts (Stops de Compradores Forzados)
                </span>
                <span>Densidad</span>
              </div>

              {shortClusters.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-800 rounded-lg">
                  Ningún clúster de shorts supera el umbral de {threshold.toFixed(2)}.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {shortClusters.map(c => {
                    const isTarget = highlightedClusterId === c.id || c.isMagneticWall;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCluster(c)}
                        className={`group relative p-2 rounded-lg border transition-all cursor-pointer ${
                          isTarget
                            ? 'bg-rose-950/30 border-rose-500/50 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Background Density Fill Bar */}
                        <div
                          className="absolute inset-y-0 right-0 bg-gradient-to-l from-rose-500/20 via-rose-500/10 to-transparent rounded-r-lg pointer-events-none transition-all"
                          style={{ width: `${c.density * 100}%` }}
                        />

                        <div className="relative flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">
                              {priceFormatter(c.price)}
                            </span>
                            <span className="text-[10px] text-rose-400 font-semibold">
                              +{c.distancePct}%
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {c.leverage}
                            </span>
                            {c.isMagneticWall && (
                              <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                Muro Clave
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[11px]">
                              {volFormatter(c.persistence[timeframe])}
                            </span>
                            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-rose-500"
                                style={{ width: `${c.density * 100}%` }}
                              />
                            </div>
                            <span className="text-rose-400 font-bold text-[11px] w-9 text-right">
                              {(c.density * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Current Price Marker */}
            <div className="my-3 py-1.5 px-3 bg-amber-400/10 border-y border-amber-400/30 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-300 font-semibold">PRECIO ACTUAL EN VIVO:</span>
                <span className="text-white font-extrabold text-sm">{priceFormatter(currentPrice)}</span>
              </div>
              <span className="text-[11px] text-amber-400/80">Eje Cero de Liquidez</span>
            </div>

            {/* 2. LONG LIQUIDATIONS (Below Current Price - Sell Stops) */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 uppercase font-mono tracking-wider">
                <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                  <Flame className="w-3 h-3 text-cyan-400" />
                  Muros de Stops para Longs (Vendedores Forzados en Cascada)
                </span>
                <span>Densidad</span>
              </div>

              {longClusters.length === 0 ? (
                <div className="text-xs text-slate-500 py-3 text-center border border-dashed border-slate-800 rounded-lg">
                  Ningún clúster de longs supera el umbral de {threshold.toFixed(2)}.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {longClusters.map(c => {
                    const isTarget = highlightedClusterId === c.id || c.isMagneticWall;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCluster(c)}
                        className={`group relative p-2 rounded-lg border transition-all cursor-pointer ${
                          isTarget
                            ? 'bg-cyan-950/30 border-cyan-500/50 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Background Density Fill Bar */}
                        <div
                          className="absolute inset-y-0 right-0 bg-gradient-to-l from-cyan-500/20 via-cyan-500/10 to-transparent rounded-r-lg pointer-events-none transition-all"
                          style={{ width: `${c.density * 100}%` }}
                        />

                        <div className="relative flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">
                              {priceFormatter(c.price)}
                            </span>
                            <span className="text-[10px] text-cyan-400 font-semibold">
                              {c.distancePct}%
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {c.leverage}
                            </span>
                            {c.isMagneticWall && (
                              <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                Muro Clave
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[11px]">
                              {volFormatter(c.persistence[timeframe])}
                            </span>
                            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-400"
                                style={{ width: `${c.density * 100}%` }}
                              />
                            </div>
                            <span className="text-cyan-400 font-bold text-[11px] w-9 text-right">
                              {(c.density * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2 px-2">Tipo</th>
                  <th className="py-2 px-2">Precio Nivel</th>
                  <th className="py-2 px-2">Distancia</th>
                  <th className="py-2 px-2">Palanca</th>
                  <th className="py-2 px-2">Volumen Estimado</th>
                  <th className="py-2 px-2 text-right">Densidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClusters.map(c => {
                  const isShort = c.side === 'SHORT_LIQ';
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        c.isMagneticWall ? 'bg-amber-400/5' : ''
                      }`}
                    >
                      <td className="py-2 px-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isShort ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {isShort ? 'Short Liq' : 'Long Liq'}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-bold text-slate-200">
                        {priceFormatter(c.price)}
                      </td>
                      <td className={`py-2 px-2 ${isShort ? 'text-rose-400' : 'text-cyan-400'}`}>
                        {c.distancePct > 0 ? `+${c.distancePct}%` : `${c.distancePct}%`}
                      </td>
                      <td className="py-2 px-2 text-slate-400">{c.leverage}</td>
                      <td className="py-2 px-2 text-slate-300">
                        {volFormatter(c.persistence[timeframe])}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-amber-400">
                        {(c.density * 100).toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected Cluster Detail Box */}
        {selectedCluster && (
          <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300 mb-1.5 font-sans font-bold">
              <span>Auditoría de Clúster #{selectedCluster.id.slice(-6)}</span>
              <button
                onClick={() => setSelectedCluster(null)}
                className="text-slate-500 hover:text-white text-xs"
              >
                ✕ Cerrar
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-slate-400 text-[11px]">
              <div>
                <span className="block text-slate-600">Vol 12H:</span>
                <span className="text-slate-200 font-bold">{volFormatter(selectedCluster.persistence['12H'])}</span>
              </div>
              <div>
                <span className="block text-slate-600">Vol 24H:</span>
                <span className="text-slate-200 font-bold">{volFormatter(selectedCluster.persistence['24H'])}</span>
              </div>
              <div>
                <span className="block text-slate-600">Vol 48H:</span>
                <span className="text-slate-200 font-bold">{volFormatter(selectedCluster.persistence['48H'])}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
