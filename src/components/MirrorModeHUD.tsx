import React from 'react';
import { CorrelationAnalysis, MagneticRadarConfluence, Timeframe } from '../types/trading';
import { Radio, Compass, AlertTriangle, ArrowUpRight, ArrowDownRight, CheckCircle2, TrendingUp } from 'lucide-react';

interface MirrorModeHUDProps {
  correlation: CorrelationAnalysis;
  magneticRadar: MagneticRadarConfluence;
  timeframe: Timeframe;
  threshold: number;
  onOpenRadarModal?: () => void;
}

export const MirrorModeHUD: React.FC<MirrorModeHUDProps> = ({
  correlation,
  magneticRadar,
  timeframe,
  threshold,
}) => {
  const { pearsonR, rSquared, isMirrorActive, beta, lagMinutes } = correlation;
  const {
    isDetected,
    type,
    magneticScore,
    macroPersistenceScore,
    headline,
    description,
    pepeTargetCluster,
    btcTargetCluster,
    distanceAlignmentPct,
  } = magneticRadar;

  // Correlation gauge percentage (-1 to +1 mapped to 0 to 100)
  const corrPct = Math.round(((pearsonR + 1) / 2) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 mb-5">
      {/* 1. MÓDULO DE CORRELACIÓN Y MODO ESPEJO (5 Cols) */}
      <div
        className={`lg:col-span-5 rounded-xl border p-4 transition-all duration-300 relative overflow-hidden ${
          isMirrorActive
            ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Radio
              className={`w-4 h-4 ${
                isMirrorActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Correlación de Pearson (BTC ⟷ PEPE)
            </span>
          </div>

          {/* INDICADOR VISUAL REQUERIDO: "MODO ESPEJO ACTIVO" */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all ${
              isMirrorActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm animate-pulse'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isMirrorActive ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>{isMirrorActive ? 'MODO ESPEJO ACTIVO' : 'ESPEJO INACTIVO (<0.85)'}</span>
          </div>
        </div>

        {/* Big Metric Display */}
        <div className="flex items-end justify-between gap-4 mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  isMirrorActive ? 'text-emerald-300' : pearsonR > 0.5 ? 'text-amber-300' : 'text-slate-200'
                }`}
              >
                {pearsonR >= 0 ? `+${pearsonR.toFixed(3)}` : pearsonR.toFixed(3)}
              </span>
              <span className="text-xs font-mono text-slate-400">
                (R² = {(rSquared * 100).toFixed(1)}%)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isMirrorActive
                ? 'Acoplamiento institucional de alta convicción: PEPE replica vectores de BTC.'
                : 'Correlación moderada o divergencia temporal entre ambos activos.'}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400">Beta Sensibilidad</div>
            <div className="font-mono text-base font-bold text-indigo-300">
              {beta.toFixed(2)}x
            </div>
            <div className="text-[11px] text-slate-400">
              {lagMinutes === 0 ? 'Sin desfase (0m)' : `Desfase: ~${lagMinutes}m`}
            </div>
          </div>
        </div>

        {/* Correlation Range Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Divergencia (-1.0)</span>
            <span className="text-amber-400">Umbral Espejo 0.85</span>
            <span className="text-emerald-400">Perfecta (+1.0)</span>
          </div>
          <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isMirrorActive ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-slate-600'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, corrPct))}%` }}
            />
            {/* Line indicator for 0.85 threshold */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: `${Math.round(((0.85 + 1) / 2) * 100)}%` }}
              title="Umbral 0.85"
            />
          </div>
        </div>
      </div>

      {/* 2. RADAR DE ZONAS MAGNÉTICAS & ALERTA DE CONFLUENCIA (7 Cols) */}
      <div
        className={`lg:col-span-7 rounded-xl border p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
          isDetected
            ? 'bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-950 border-amber-500/50 shadow-lg shadow-amber-500/10'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Compass
              className={`w-4 h-4 ${
                isDetected ? 'text-amber-400 animate-spin' : 'text-slate-400'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Detector de Zonas Magnéticas (El Radar)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              [Ventana {timeframe} | Umbral {threshold.toFixed(2)}]
            </span>
          </div>

          {/* ALERTA VISUAL REQUERIDA: "Zona de Atracción Detectada" */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all ${
              isDetected
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm animate-pulse'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
            }`}
          >
            {isDetected ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{isDetected ? 'ZONA DE ATRACCIÓN DETECTADA' : 'RADAR: SIN CONFLUENCIA CRÍTICA'}</span>
          </div>
        </div>

        {/* Radar Confluence Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-2">
          <div className="md:col-span-8 space-y-1">
            <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              {type === 'BULLISH_SHORT_HUNT' ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <ArrowUpRight className="w-4 h-4" />
                  Muro de Liquidación de Shorts (Stop Run Alcista)
                </span>
              ) : type === 'BEARISH_LONG_HUNT' ? (
                <span className="inline-flex items-center gap-1 text-rose-400">
                  <ArrowDownRight className="w-4 h-4" />
                  Muro de Liquidación de Longs (Stop Run Bajista)
                </span>
              ) : (
                <span className="text-slate-400">Sin atracción coordinada</span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {description}
            </p>

            {pepeTargetCluster && btcTargetCluster && (
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 text-slate-300">
                  Target PEPE: <strong className="text-amber-300">${pepeTargetCluster.price.toFixed(6)}</strong> ({pepeTargetCluster.distancePct > 0 ? '+' : ''}{pepeTargetCluster.distancePct}%)
                </span>
                <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 text-slate-300">
                  Target BTC: <strong className="text-amber-300">${btcTargetCluster.price.toLocaleString()}</strong> ({btcTargetCluster.distancePct > 0 ? '+' : ''}{btcTargetCluster.distancePct}%)
                </span>
                <span className="text-slate-400">
                  Delta dist: {distanceAlignmentPct.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {/* Magnetic Strength Score (1 al 10) */}
          <div className="md:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Fuerza Magnética</span>
              <span className="font-mono text-lg font-extrabold text-amber-400">
                {magneticScore}<span className="text-xs text-slate-500">/10</span>
              </span>
            </div>

            {/* Score progress bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden my-1.5">
              <div
                className={`h-full ${
                  magneticScore >= 8
                    ? 'bg-amber-400'
                    : magneticScore >= 5
                    ? 'bg-indigo-400'
                    : 'bg-slate-600'
                }`}
                style={{ width: `${magneticScore * 10}%` }}
              />
            </div>

            {/* Macro validation indicator */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Validación Macro:</span>
              <span className={macroPersistenceScore >= 8 ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                {macroPersistenceScore >= 8 ? 'PERSISTENTE (12H➔48H)' : 'ZONA TRANSITORIA'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
