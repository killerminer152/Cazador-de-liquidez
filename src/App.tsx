import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MarketData, Timeframe } from './types/trading';
import {
  analyzeMirrorMarket,
  fetchLiveBinanceMarket,
  generateSyntheticMarket,
} from './services/quantEngine';
import { soundEngine } from './services/soundEngine';
import { Header } from './components/Header';
import { ControlToolbar } from './components/ControlToolbar';
import { MirrorModeHUD } from './components/MirrorModeHUD';
import { AssetLiquidationPanel } from './components/AssetLiquidationPanel';
import { RiskManagementModule } from './components/RiskManagementModule';
import { MagneticRadarDeepDive } from './components/MagneticRadarDeepDive';
import { GitHubDeployModal } from './components/GitHubDeployModal';
import { BookOpen, Github, Terminal, Volume2, X } from 'lucide-react';

export default function App() {
  const [timeframe, setTimeframe] = useState<Timeframe>('12H');
  const [threshold, setThreshold] = useState<number>(0.63);
  const [activeTab, setActiveTab] = useState<'terminal' | 'radar' | 'risk' | 'github'>('terminal');
  const [dataSource, setDataSource] = useState<'live' | 'simulation'>('live');
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Audio alerts state
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [soundVolume, setSoundVolume] = useState<number>(0.65);
  const [activeAlertToast, setActiveAlertToast] = useState<{
    message: string;
    type: 'mirror' | 'radar';
  } | null>(null);

  // Refs to avoid repeat fire on identical states
  const prevMirrorActiveRef = useRef<boolean>(false);
  const prevRadarClusterIdRef = useRef<string | null>(null);
  const hasInitializedRef = useRef<boolean>(false);

  // Initialize market states with high-precision quantitative baseline
  const [btcMarket, setBtcMarket] = useState<MarketData>(() =>
    generateSyntheticMarket('BTCUSDT')
  );
  const [pepeMarket, setPepeMarket] = useState<MarketData>(() =>
    generateSyntheticMarket('1000PEPEUSDT')
  );

  // Data fetcher function
  const loadMarketData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (dataSource === 'live') {
        const [btc, pepe] = await Promise.all([
          fetchLiveBinanceMarket('BTCUSDT'),
          fetchLiveBinanceMarket('1000PEPEUSDT'),
        ]);
        setBtcMarket(btc);
        setPepeMarket(pepe);
      } else {
        setBtcMarket(generateSyntheticMarket('BTCUSDT'));
        setPepeMarket(generateSyntheticMarket('1000PEPEUSDT'));
      }
    } catch (err) {
      console.error('Error fetching market data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dataSource]);

  // Initial load and periodic polling every 12 seconds
  useEffect(() => {
    loadMarketData();
    const interval = setInterval(() => {
      loadMarketData();
    }, 12000);
    return () => clearInterval(interval);
  }, [loadMarketData]);

  // Run quantitative correlation and magnetic radar engine
  const { correlation, magneticRadar } = analyzeMirrorMarket(
    btcMarket,
    pepeMarket,
    timeframe,
    threshold
  );

  // Monitor triggers for Audio Notifications
  useEffect(() => {
    // Sync sound engine parameters
    soundEngine.setMuted(!isSoundEnabled);
    soundEngine.setVolume(soundVolume);

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      prevMirrorActiveRef.current = correlation.isMirrorActive;
      prevRadarClusterIdRef.current = magneticRadar.pepeTargetCluster?.id || null;
      return;
    }

    // 1. Triggers when Pearson Correlation crosses critical threshold of 0.85
    if (correlation.isMirrorActive && !prevMirrorActiveRef.current) {
      if (isSoundEnabled) {
        soundEngine.playMirrorModeAlert();
      }
      setActiveAlertToast({
        message: `¡MODO ESPEJO ACTIVO! Correlación de Pearson superó el umbral crítico (+${correlation.pearsonR.toFixed(3)} > 0.85)`,
        type: 'mirror',
      });
      setTimeout(() => setActiveAlertToast(null), 7000);
    }
    prevMirrorActiveRef.current = correlation.isMirrorActive;

    // 2. Triggers when a new Magnetic Attraction Zone is detected
    const currentTargetId = magneticRadar.isDetected
      ? `${magneticRadar.pepeTargetCluster?.id}-${magneticRadar.type}`
      : null;

    if (
      magneticRadar.isDetected &&
      currentTargetId &&
      currentTargetId !== prevRadarClusterIdRef.current
    ) {
      if (isSoundEnabled) {
        soundEngine.playMagneticRadarAlert();
      }
      setActiveAlertToast({
        message: `¡ZONA DE ATRACCIÓN DETECTADA! Muro de Liquidación alineado [Fuerza Magnética: ${magneticRadar.magneticScore}/10]`,
        type: 'radar',
      });
      setTimeout(() => setActiveAlertToast(null), 7000);
    }
    prevRadarClusterIdRef.current = currentTargetId;
  }, [
    correlation.isMirrorActive,
    correlation.pearsonR,
    magneticRadar.isDetected,
    magneticRadar.pepeTargetCluster?.id,
    magneticRadar.magneticScore,
    magneticRadar.type,
    isSoundEnabled,
    soundVolume,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        isMirrorActive={correlation.isMirrorActive}
        correlationR={correlation.pearsonR}
      />

      {/* Real-time Audio Alert Toast Notification */}
      {activeAlertToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce duration-300">
          <div
            className={`p-3.5 rounded-xl border shadow-2xl flex items-center justify-between gap-3 text-xs font-semibold backdrop-blur-md ${
              activeAlertToast.type === 'mirror'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : 'bg-amber-950/90 border-amber-500 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 shrink-0 animate-pulse" />
              <span>{activeAlertToast.message}</span>
            </div>
            <button
              onClick={() => setActiveAlertToast(null)}
              className="p-1 hover:bg-black/30 rounded text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4">
        {/* Controls Toolbar: Timeframes, Threshold Slider & Sound Controls */}
        <ControlToolbar
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          threshold={threshold}
          setThreshold={setThreshold}
          onRefresh={loadMarketData}
          isLoading={isLoading}
          lastUpdated={btcMarket.lastUpdated}
          dataSource={dataSource}
          setDataSource={setDataSource}
          isSoundEnabled={isSoundEnabled}
          setIsSoundEnabled={setIsSoundEnabled}
          soundVolume={soundVolume}
          setSoundVolume={setSoundVolume}
        />

        {/* Real-time Pearson Correlation & Magnetic Radar HUD */}
        <MirrorModeHUD
          correlation={correlation}
          magneticRadar={magneticRadar}
          timeframe={timeframe}
          threshold={threshold}
        />

        {/* Tab 1: Terminal Espejo (Dual Parallel Columns BTC ⟷ 1000PEPE) */}
        {activeTab === 'terminal' && (
          <div className="space-y-5">
            {/* Parallel 2-Column Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
              {/* Left Column: BTC Data & Liquidation Map */}
              <div className="h-full">
                <AssetLiquidationPanel
                  market={btcMarket}
                  timeframe={timeframe}
                  threshold={threshold}
                  highlightedClusterId={magneticRadar.btcTargetCluster?.id}
                  isMirrorActive={correlation.isMirrorActive}
                />
              </div>

              {/* Right Column: $1000PEPE Data & Liquidation Map */}
              <div className="h-full">
                <AssetLiquidationPanel
                  market={pepeMarket}
                  timeframe={timeframe}
                  threshold={threshold}
                  highlightedClusterId={magneticRadar.pepeTargetCluster?.id}
                  isMirrorActive={correlation.isMirrorActive}
                />
              </div>
            </div>

            {/* Risk Management Module with Required Warning and Overshoot Calculator */}
            <RiskManagementModule
              btcMarket={btcMarket}
              pepeMarket={pepeMarket}
              radar={magneticRadar}
            />
          </div>
        )}

        {/* Tab 2: Radar Magnético Deep Dive */}
        {activeTab === 'radar' && (
          <div className="space-y-5">
            <MagneticRadarDeepDive
              btcMarket={btcMarket}
              pepeMarket={pepeMarket}
              radar={magneticRadar}
              correlation={correlation}
              timeframe={timeframe}
              threshold={threshold}
            />
            {/* Risk Management integration */}
            <RiskManagementModule
              btcMarket={btcMarket}
              pepeMarket={pepeMarket}
              radar={magneticRadar}
            />
          </div>
        )}

        {/* Tab 3: Risk Management Module Alone */}
        {activeTab === 'risk' && (
          <div className="space-y-5">
            <RiskManagementModule
              btcMarket={btcMarket}
              pepeMarket={pepeMarket}
              radar={magneticRadar}
            />
          </div>
        )}

        {/* Tab 4: GitHub Documentation */}
        {activeTab === 'github' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Guía de Despliegue y Arquitectura para GitHub
                  </h2>
                  <p className="text-xs text-slate-400">
                    Estructura modular con soporte nativo para React/Node y Python/Streamlit
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Ver Código Completo</span>
              </button>
            </div>

            <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-3 font-mono">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <p className="text-amber-300 font-bold mb-2">Estructura del Proyecto para GitHub & Vercel:</p>
                <pre className="text-[11px] text-slate-300">
{`quant-liquidation-mirror/
├── vercel.json            # Configuración nativa para Vercel (rewrites SPA & headers)
├── vite.config.ts         # Configuración Vite optimizada para producción
├── package.json           # Scripts de build y dependencias React 19 / Tailwind
├── app_streamlit.py       # Aplicación nativa en Python con Streamlit
├── requirements.txt       # Dependencias para Python (pandas, numpy, streamlit, requests)
├── README.md              # Documentación técnica completa y guía de despliegue
├── src/
│   ├── App.tsx            # Punto de entrada React con Modo Espejo
│   ├── components/        # Componentes UI (HUD, Heatmap, Radar, Riesgo, Toolbar)
│   ├── services/          # Motor cuantitativo (Pearson r, soundEngine, API Binance)
│   └── types/             # Modelos de dominio y tipados TypeScript
└── dist/                  # Directorio generado en build para Vercel CDN`}
                </pre>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <p className="text-emerald-400 font-bold">Comandos de Inicialización y Despliegue:</p>
                <div className="space-y-1">
                  <p className="text-slate-400"># Opción 1: Despliegue en Vercel (Recomendada)</p>
                  <code className="text-white bg-slate-900 px-2.5 py-1.5 rounded block text-[11px]">
                    git init && git add . && git commit -m "deploy to vercel" && git push
                  </code>
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    Importa tu repositorio en vercel.com/new. Detectará Vite y desplegará en 30 segundos automáticamente.
                  </p>
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-slate-400"># Opción 2: Desarrollo Local React + Vite</p>
                  <code className="text-white bg-slate-900 px-2.5 py-1.5 rounded block text-[11px]">
                    npm install && npm run dev
                  </code>
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-slate-400"># Opción 3: Ejecución Python + Streamlit</p>
                  <code className="text-white bg-slate-900 px-2.5 py-1.5 rounded block text-[11px]">
                    pip install -r requirements.txt && streamlit run app_streamlit.py
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* GitHub Export Modal */}
      <GitHubDeployModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Institutional Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>QuantMirror Terminal · Binance Futures Data Protocol</span>
          <span>Estrategia Cuantitativa de Liquidaciones y Confluencia de Muros</span>
        </div>
      </footer>
    </div>
  );
}
