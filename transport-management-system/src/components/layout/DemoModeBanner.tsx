'use client';

import React from 'react';
import { AlertCircle, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { useDemoTMS } from '../../lib/demo-context';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, activeRole, resetToDefaultDemo } = useDemoTMS();

  if (!isDemoMode) return null;

  return (
    <aside aria-label="Demo mode notice" className="w-full bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[10px]">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            Interactive Simulation
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Active Persona: <strong className="text-white uppercase font-semibold">{activeRole}</strong>
          </span>
          <span className="text-amber-300/80">
            • Client-side Prototype with sample records (No live database mutated)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefaultDemo}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors underline decoration-dotted"
            title="Reset to default mock state"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Data
          </button>
        </div>
      </div>
    </aside>
  );
};
