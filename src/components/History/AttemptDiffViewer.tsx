import React from 'react';
import type { Attempt } from '../../domain/types';
import { ArrowRight } from 'lucide-react';

interface AttemptDiffViewerProps {
  attemptA: Attempt; // Previous
  attemptB: Attempt; // Current / Newer
}

export const AttemptDiffViewer: React.FC<AttemptDiffViewerProps> = ({ attemptA, attemptB }) => {
  const scoreDiff = (attemptB.evaluation?.score || 0) - (attemptA.evaluation?.score || 0);

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
      {/* Header comparison summary */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Attempt #{attemptA.attemptNumber} vs Attempt #{attemptB.attemptNumber}
          </h3>
          <p className="text-[11px] text-slate-400">Comparing design evolution and score delta</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400">Score: {attemptA.evaluation?.score || 0}</span>
          <ArrowRight className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-extrabold text-indigo-400">{attemptB.evaluation?.score || 0}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              scoreDiff >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff}
          </span>
        </div>
      </div>

      {/* Side by side code view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attempt A */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Attempt #{attemptA.attemptNumber} ({attemptA.rawSubmission.formatId})</span>
            <span>Score: {attemptA.evaluation?.score}</span>
          </div>
          <pre className="h-64 overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-slate-300 border border-slate-800">
            {attemptA.rawSubmission.content}
          </pre>
        </div>

        {/* Attempt B */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400">
            <span>Attempt #{attemptB.attemptNumber} ({attemptB.rawSubmission.formatId})</span>
            <span>Score: {attemptB.evaluation?.score}</span>
          </div>
          <pre className="h-64 overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-emerald-300 border border-indigo-500/30">
            {attemptB.rawSubmission.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
