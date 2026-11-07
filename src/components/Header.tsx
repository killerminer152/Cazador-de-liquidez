import React from 'react';
import { Layers, ShieldAlert, Sparkles, Github, ExternalLink, Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: 'terminal' | 'radar' | 'risk' | 'github';
  setActiveTab: (tab: 'terminal' | 'radar' | 'risk' | 'github') => void;
  onOpenGitHubModal: () => void;
  isMirrorActive: boolean;
  correlationR: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenGitHubModal,
  isMirrorActive,
  correlationR,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark as per Top Bar Contract) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            QuantMirror Terminal
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line text links) */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'terminal' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Terminal Espejo
          </button>
          <button
            onClick={() => setActiveTab('radar')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'radar' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Radar Magnético
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'risk' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Gestión de Riesgo
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeTab === 'github' ? 'text-amber-400 font-semibold' : ''
            }`}
          >
            Documentación GitHub
          </button>
        </nav>

        {/* Zone 3: Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 rounded-md">
            <span>Pearson r:</span>
            <span className={`font-bold ${isMirrorActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {correlationR > 0 ? `+${correlationR.toFixed(3)}` : correlationR.toFixed(3)}
            </span>
            <span className="text-slate-600">|</span>
            <span className={isMirrorActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {isMirrorActive ? 'ESPEJO ON' : 'ESPEJO OFF'}
            </span>
          </div>

          <button
            onClick={onOpenGitHubModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Exportar Repositorio</span>
          </button>
        </div>
      </div>
    </header>
  );
};
