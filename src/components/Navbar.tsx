import React from 'react';
import { Layers, History, Key } from 'lucide-react';
import type { Problem } from '../domain/types';

interface NavbarProps {
  problems: Problem[];
  activeProblem: Problem;
  onSelectProblem: (problem: Problem) => void;
  onOpenHistory: () => void;
  onOpenApiKeyModal: () => void;
  attemptCount: number;
  currentScreen?: 'catalog' | 'editor' | 'feedback' | 'history';
  onNavigate?: (screen: 'catalog' | 'editor' | 'feedback' | 'history') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  problems,
  activeProblem,
  onSelectProblem,
  onOpenHistory,
  onOpenApiKeyModal,
  attemptCount,
  currentScreen = 'catalog',
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onNavigate?.('catalog')}
            className="flex items-center space-x-3 text-left focus:outline-none group"
            title="Go to Problem Catalog"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                  LLD Workbench
                </span>
                <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                  PROTOTYPE
                </span>
              </div>
            </div>
          </button>

          {/* Nav Links */}
          <nav className="hidden sm:flex items-center space-x-1">
            <button
              onClick={() => onNavigate?.('catalog')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                currentScreen === 'catalog'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Problems
            </button>
            <button
              onClick={() => onNavigate?.('editor')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                currentScreen === 'editor' || currentScreen === 'feedback'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Workspace
            </button>
          </nav>
        </div>

        {/* Center: Problem Quick Switcher (when in workspace) */}
        {currentScreen !== 'catalog' && (
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-[11px] font-medium text-slate-400">Problem:</span>
            <select
              value={activeProblem.id}
              onChange={(e) => {
                const p = problems.find((item) => item.id === e.target.value);
                if (p) onSelectProblem(p);
              }}
              className="rounded-lg border border-slate-700 bg-slate-800/90 px-2.5 py-1 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {problems.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.difficulty}] {p.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Actions & Settings */}
        <div className="flex items-center space-x-2.5">
          {/* History / Attempts Button */}
          <button
            onClick={onOpenHistory}
            className="relative inline-flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700/80 hover:text-white transition-colors"
          >
            <History className="h-3.5 w-3.5 text-indigo-400" />
            <span>Attempts</span>
            {attemptCount > 0 && (
              <span className="ml-1 rounded-full bg-indigo-500 px-1.5 py-0.2 text-[10px] font-bold text-white font-mono">
                {attemptCount}
              </span>
            )}
          </button>

          {/* AI Config Modal Trigger */}
          <button
            onClick={onOpenApiKeyModal}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700/80 hover:text-white transition-colors"
            title="Configure OpenAI API Key or Evaluator Heuristics"
          >
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Config</span>
          </button>
        </div>
      </div>
    </header>
  );
};
