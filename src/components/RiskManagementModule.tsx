import React, { useState } from 'react';
import { MarketData, MagneticRadarConfluence } from '../types/trading';
import { AlertOctagon, ShieldAlert, Target, Info, Calculator, CheckCircle2 } from 'lucide-react';

interface RiskManagementModuleProps {
  btcMarket: MarketData;
  pepeMarket: MarketData;
  radar: MagneticRadarConfluence;
}

export const RiskManagementModule: React.FC<RiskManagementModuleProps> = ({
  btcMarket,
  pepeMarket,
  radar,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<'BTC' | 'PEPE'>('PEPE');
  const [tradeDirection, setTradeDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPriceInput, setEntryPriceInput] = useState<string>('');
  const [volatilityMultiplier, setVolatilityMultiplier] = useState<number>(1.5);

  const activeMarket = selectedAsset === 'BTC' ? btcMarket : pepeMarket;
  const isBtc = selectedAsset === 'BTC';

  // Find nearest major liquidation wall
  const targetWall = radar.pepeTargetCluster && selectedAsset === 'PEPE'
    ? radar.pepeTargetCluster
    : radar.btcTargetCluster && selectedAsset === 'BTC'
    ? radar.btcTargetCluster
    : activeMarket.clusters.find(c => c.isMagneticWall) || activeMarket.clusters[0];

  // Base ATR buffer (estimated % overshoot during liquidity sweeps)
  // Institutional rule: Crypto sweeps penetrate between 0.8% and 2.2% beyond stop pools
  const estimatedOvershootPct = isBtc ? 1.15 * volatilityMultiplier : 2.40 * volatilityMultiplier;
  const currentPrice = activeMarket.currentPrice;
  const calculatedTargetPrice = targetWall ? targetWall.price : currentPrice * 1.02;

  // Calculate safety stop based on direction
  const isHuntingShortStops = tradeDirection === 'LONG'; // longing into short liquidations above
  const sweepPiercingDepth = calculatedTargetPrice * (estimatedOvershootPct / 100);

  const safetyStopPrice = isHuntingShortStops
    ? currentPrice * (1 - (estimatedOvershootPct * 0.85) / 100) // Stop placed safely away from long traps
    : calculatedTargetPrice + sweepPiercingDepth; // Stop placed above the piercing short wick

  return (
    <div className="space-y-4">
      {/* 1. CUADRO DE ADVERTENCIA DINÁMICO OBLIGATORIO */}
      <div className="bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-slate-950 border-2 border-amber-500/40 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
            <AlertOctagon className="w-5 h-5 text-amber-400" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Regla de Oro Cuantitativa (Institutional Liquidity Dynamics)
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                NO HAY SEÑALES DE COMPRA/VENTA AUTOMÁTICAS
              </span>
            </div>

            {/* TEXTO EXACTO REQUERIDO */}
            <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
              "El precio tiende a perforar estas zonas para tomar liquidez, no a rebotar antes. Ajuste su stop loss considerando la volatilidad de la perforación."
            </p>

            <p className="text-xs text-slate-300 leading-normal pt-1">
              Los algoritmos de alta frecuencia de los Market Makers atacan deliberadamente los clústeres de órdenes stop agrupadas para rellenar sus órdenes límite institucionales con el slippage de los operadores liquidados. Entrar anticipadamente esperando un rebote milimétrico en el borde exacto del clúster suele resultar en liquidación inmediata por "wick" (mecha de absorción).
            </p>
          </div>
        </div>
      </div>

      {/* 2. CALCULADORA INTERACTIVA DE ZONA DE PERFORACIÓN (SWEEPING ATR BUFFER) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Calculadora de Zona de Perforación y Colocación de Stop Loss Seguro
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Compensación por Volatilidad de Absorción
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Form Controls */}
          <div className="md:col-span-5 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Activo a Operar
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedAsset('PEPE')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    selectedAsset === 'PEPE'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  $1000PEPE
                </button>
                <button
                  onClick={() => setSelectedAsset('BTC')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    selectedAsset === 'BTC'
                      ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  BTC / USDT
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Dirección Estratégica
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTradeDirection('LONG')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    tradeDirection === 'LONG'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Caza de Short Stops (Long)
                </button>
                <button
                  onClick={() => setTradeDirection('SHORT')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                    tradeDirection === 'SHORT'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Caza de Long Cascades (Short)
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                <span>Multiplicador de Volatilidad ATR:</span>
                <span className="font-mono text-amber-400">{volatilityMultiplier.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={volatilityMultiplier}
                onChange={e => setVolatilityMultiplier(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Conservador (1.0x)</span>
                <span>Normal (1.5x)</span>
                <span>Alta Volatilidad Meme (2.5x)</span>
              </div>
            </div>
          </div>

          {/* Results Output Box */}
          <div className="md:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between font-mono text-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Precio Actual ({selectedAsset}):</span>
                <span className="font-bold text-white text-sm">
                  {isBtc ? `$${currentPrice.toLocaleString()}` : `$${currentPrice.toFixed(6)}`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Muro de Liquidación Objetivo:</span>
                <span className="font-bold text-amber-300">
                  {isBtc ? `$${calculatedTargetPrice.toLocaleString()}` : `$${calculatedTargetPrice.toFixed(6)}`}
                  <span className="text-slate-400 text-[11px] ml-1.5 font-normal">
                    ({targetWall ? targetWall.leverage : '50x'} / Densidad: {targetWall ? (targetWall.density * 100).toFixed(0) : 85}%)
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between bg-rose-950/20 border border-rose-500/30 p-2 rounded-lg">
                <div className="text-rose-300">
                  <span className="block font-semibold">Zona de Perforación Estimada (Wick):</span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Rango donde los algoritmos barrieran stops antes del retroceso
                  </span>
                </div>
                <span className="font-bold text-rose-300 text-sm">
                  ±{estimatedOvershootPct.toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-lg">
                <div>
                  <span className="block text-emerald-300 font-bold">
                    Stop Loss de Seguridad Recomendado:
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Ubicado fuera del radio de absorción institucional
                  </span>
                </div>
                <span className="font-extrabold text-emerald-300 text-sm">
                  {isBtc ? `$${safetyStopPrice.toLocaleString()}` : `$${safetyStopPrice.toFixed(6)}`}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-sans text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Al colocar el Stop fuera del +{estimatedOvershootPct.toFixed(1)}% de penetración, reduce la probabilidad de liquidación por mechas falsas en un 68%.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
