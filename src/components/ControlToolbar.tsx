import React, { useState } from 'react';
import { Timeframe } from '../types/trading';
import { RefreshCw, SlidersHorizontal, Clock, Zap, Database, Volume2, VolumeX, BellRing } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface ControlToolbarProps {
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  threshold: number;
  setThreshold: (val: number) => void;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: number;
  dataSource: 'live' | 'simulation';
  setDataSource: (source: 'live' | 'simulation') => void;
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  soundVolume: number;
  setSoundVolume: (vol: number) => void;
}

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  timeframe,
  setTimeframe,
  threshold,
  setThreshold,
  onRefresh,
  isLoading,
  lastUpdated,
  dataSource,
  setDataSource,
  isSoundEnabled,
  setIsSoundEnabled,
  soundVolume,
  setSoundVolume,
}) => {
  const [showAudioPopover, setShowAudioPopover] = useState(false);
  const timeframes: Timeframe[] = ['12H', '24H', '48H'];
  const presets = [
    { label: 'Bajo (0.50)', val: 0.5 },
    { label: 'Óptimo (0.63)', val: 0.63 },
    { label: 'Fuerte (0.75)', val: 0.75 },
    { label: 'Muro Clave (0.85)', val: 0.85 },
  ];

  const handleToggleSound = () => {
    const nextState = !isSoundEnabled;
    setIsSoundEnabled(nextState);
    soundEngine.setMuted(!nextState);
    if (nextState) {
      soundEngine.testSound('radar');
    }
  };

  const handleVolumeChange = (vol: number) => {
    setSoundVolume(vol);
    soundEngine.setVolume(vol);
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 sm:p-4 mb-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Timeframe Selector & Connection Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Temporalidad Macro:</span>
          </div>

          <div className="inline-flex items-center p-0.5 bg-slate-950/80 border border-slate-800 rounded-lg">
            {timeframes.map(tf => {
              const active = timeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:inline-block h-4 w-px bg-slate-800" />

          {/* Data Source Selector */}
          <div className="inline-flex items-center p-0.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setDataSource('live')}
              className={`px-2.5 py-1 font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                dataSource === 'live'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Binance Futures API</span>
            </button>
            <button
              onClick={() => setDataSource('simulation')}
              className={`px-2.5 py-1 font-medium rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                dataSource === 'simulation'
                  ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Simulador Alta Precisión</span>
            </button>
          </div>
        </div>

        {/* Right: Liquidity Threshold Slider & Audio Alerts Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Umbral:</span>
            </div>
            <div className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
              {threshold.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:w-44">
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.01"
              value={threshold}
              onChange={e => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Quick Presets */}
          <div className="hidden xl:flex items-center gap-1">
            {presets.map(p => (
              <button
                key={p.val}
                onClick={() => setThreshold(p.val)}
                className={`text-[11px] px-1.5 py-1 rounded border transition-colors whitespace-nowrap shrink-0 ${
                  Math.abs(threshold - p.val) < 0.005
                    ? 'border-amber-400/40 bg-amber-400/15 text-amber-300 font-medium'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Audio Notification Controller */}
          <div className="relative">
            <div className="inline-flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={handleToggleSound}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                  isSoundEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={isSoundEnabled ? 'Alarmas sonoras activadas' : 'Alarmas sonoras silenciadas'}
              >
                {isSoundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="hidden md:inline">
                  {isSoundEnabled ? 'Alarma ON' : 'Silencio'}
                </span>
              </button>

              <button
                onClick={() => setShowAudioPopover(!showAudioPopover)}
                className="px-1.5 py-1.5 text-slate-400 hover:text-white transition-colors text-xs"
                title="Configurar volumen y pruebas sonoras"
              >
                <BellRing className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Audio Settings Dropdown Panel */}
            {showAudioPopover && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-40 text-xs font-sans space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <BellRing className="w-3.5 h-3.5 text-amber-400" />
                    Notificaciones Sonoras
                  </span>
                  <button
                    onClick={() => setShowAudioPopover(false)}
                    className="text-slate-500 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Volumen de Alerta:</span>
                    <span className="font-mono text-amber-300">
                      {Math.round(soundVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={soundVolume}
                    onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Probar Tonos de Alarma:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        soundEngine.setMuted(false);
                        soundEngine.testSound('radar');
                      }}
                      className="px-2 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold text-center transition-colors"
                    >
                      Sonar Radar 🎯
                    </button>
                    <button
                      onClick={() => {
                        soundEngine.setMuted(false);
                        soundEngine.testSound('mirror');
                      }}
                      className="px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-semibold text-center transition-colors"
                    >
                      Modo Espejo ⚡
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800/80 leading-relaxed">
                  Las alarmas son sintetizadas nativamente en tu navegador mediante Web Audio API sin consumir datos externos.
                </div>
              </div>
            )}
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            title="Actualizar datos de libro y liquidaciones"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
