import React from 'react';
import { CorrelationAnalysis, LiquidityCluster, MagneticRadarConfluence, MarketData, Timeframe } from '../types/trading';
import { Compass, ShieldCheck, Activity, Layers, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';

interface MagneticRadarDeepDiveProps {
  btcMarket: MarketData;
  pepeMarket: MarketData;
  radar: MagneticRadarConfluence;
  correlation: CorrelationAnalysis;
  timeframe: Timeframe;
  threshold: number;
}

export const MagneticRadarDeepDive: React.FC<MagneticRadarDeepDiveProps> = ({
  btcMarket,
  pepeMarket,
  radar,
  correlation,
  timeframe,
  threshold,
}) => {
  const {
    isDetected,
    type,
    magneticScore,
    macroPersistenceScore,
    pepeTargetCluster,
    btcTargetCluster,
    distanceAlignmentPct,
    headline,
    description,
  } = radar;

  return (
    <div className="space-y-4">
      {/* Radar Main Status Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Detector de Zonas Magnéticas & Validación Macro</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {timeframe} | Umbral {threshold.toFixed(2)}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sincronización multi-temporal y detección de clusters espejo en libros de órdenes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Puntuación Magnética</div>
              <div className="text-2xl font-mono font-extrabold text-amber-400">
                {magneticScore}<span className="text-sm text-slate-500">/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Card 1: Macro Persistence */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Validación Macro (12H➔48H)</span>
              <span className="font-mono text-emerald-400 font-bold">{macroPersistenceScore}/10</span>
            </div>
            <p className="text-xs text-slate-300">
              Verifica si los niveles de liquidación de 12H se mantienen o aumentan de volumen en 24H y 48H.
            </p>
            {pepeTargetCluster && (
              <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800/80 space-y-1">
                <div className="flex justify-between">
                  <span>Volumen 12H:</span>
                  <span className="text-slate-200">${(pepeTargetCluster.persistence['12H'] / 1e6).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span>Volumen 24H:</span>
                  <span className="text-slate-200">${(pepeTargetCluster.persistence['24H'] / 1e6).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span>Volumen 48H:</span>
                  <span className="text-emerald-400 font-bold">${(pepeTargetCluster.persistence['48H'] / 1e6).toFixed(1)}M (+{(((pepeTargetCluster.persistence['48H'] - pepeTargetCluster.persistence['12H']) / pepeTargetCluster.persistence['12H']) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Pearson Mirror Match */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Sincronía Espejo BTC/PEPE</span>
              <span className="font-mono text-indigo-300 font-bold">
                {correlation.pearsonR > 0.85 ? '10/10' : '6/10'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Correlación de Pearson actual en <strong className="text-amber-400">{correlation.pearsonR.toFixed(3)}</strong>. {correlation.isMirrorActive ? 'Activo (>0.85).' : 'Por debajo de 0.85.'}
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800/80 space-y-1">
              <div className="flex justify-between">
                <span>Coeficiente R²:</span>
                <span className="text-slate-200">{(correlation.rSquared * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Beta Dinámico:</span>
                <span className="text-slate-200">{correlation.beta.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between">
                <span>Desfase Temporal:</span>
                <span className="text-slate-200">~{correlation.lagMinutes} min</span>
              </div>
            </div>
          </div>

          {/* Card 3: Distance & Direction Confluence */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Confluencia Geométrica</span>
              <span className="font-mono text-amber-400 font-bold">{isDetected ? '9/10' : '3/10'}</span>
            </div>
            <p className="text-xs text-slate-300">
              Coincidencia direccional y de distancia porcentual entre los mayores pozos de stops.
            </p>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900 p-2 rounded border border-slate-800/80 space-y-1">
              <div className="flex justify-between">
                <span>Dirección Confluente:</span>
                <span className="text-slate-200 font-bold">
                  {type === 'BULLISH_SHORT_HUNT' ? 'ALCISTA (Shorts)' : type === 'BEARISH_LONG_HUNT' ? 'BAJISTA (Longs)' : 'Sin confluencia'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discrepancia Distancia:</span>
                <span className="text-slate-200">Δ {distanceAlignmentPct.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Estado Radar:</span>
                <span className={isDetected ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                  {isDetected ? 'ATRAPADO EN RANGO' : 'NEUTRAL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Comparison Visualizer */}
      {pepeTargetCluster && btcTargetCluster && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Comparativa de Objetivos de Atracción Magnética</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BTC Magnet Target */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/15">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-amber-400">Objetivo Imán BTC</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                  {btcTargetCluster.leverage} | Densidad {(btcTargetCluster.density * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-2xl font-mono font-extrabold text-white mb-1">
                ${btcTargetCluster.price.toLocaleString()}
              </div>
              <div className="text-xs font-mono text-slate-300">
                Distancia: <strong className="text-amber-400">{btcTargetCluster.distancePct > 0 ? '+' : ''}{btcTargetCluster.distancePct}%</strong> del precio actual
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Volumen acumulado en stops: ${(btcTargetCluster.persistence[timeframe] / 1e6).toFixed(1)}M USDT
              </div>
            </div>

            {/* PEPE Magnet Target */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/15">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-emerald-400">Objetivo Imán $1000PEPE</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300">
                  {pepeTargetCluster.leverage} | Densidad {(pepeTargetCluster.density * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-2xl font-mono font-extrabold text-white mb-1">
                ${pepeTargetCluster.price.toFixed(6)}
              </div>
              <div className="text-xs font-mono text-slate-300">
                Distancia: <strong className="text-emerald-400">{pepeTargetCluster.distancePct > 0 ? '+' : ''}{pepeTargetCluster.distancePct}%</strong> del precio actual
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Volumen acumulado en stops: ${(pepeTargetCluster.persistence[timeframe] / 1e6).toFixed(1)}M USDT
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
