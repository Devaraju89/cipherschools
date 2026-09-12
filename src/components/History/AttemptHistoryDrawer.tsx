import React, { useState } from 'react';
import type { Attempt } from '../../domain/types';
import { History, X, GitCompare, RotateCcw, Clock } from 'lucide-react';
import { AttemptDiffViewer } from './AttemptDiffViewer';

interface AttemptHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  attempts: Attempt[];
  onForkAndRetry: (attempt: Attempt) => void;
}

export const AttemptHistoryDrawer: React.FC<AttemptHistoryDrawerProps> = ({
  isOpen,
  onClose,
  attempts,
  onForkAndRetry,
}) => {
  const [comparingAttempts, setComparingAttempts] = useState<[Attempt, Attempt] | null>(null);

  if (!isOpen) return null;

  const handleStartDiff = (attempt: Attempt, index: number) => {
    if (index < attempts.length - 1) {
      const prevAttempt = attempts[index + 1];
      setComparingAttempts([prevAttempt, attempt]);
    } else if (attempts.length >= 2) {
      setComparingAttempts([attempts[1], attempts[0]]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="h-full w-full max-w-2xl bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">Attempt History & Iterations</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Diff View if comparing */}
        {comparingAttempts ? (
          <div className="flex-1 space-y-4">
            <button
              onClick={() => setComparingAttempts(null)}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center space-x-1"
            >
              ← Back to Attempt List
            </button>
            <AttemptDiffViewer attemptA={comparingAttempts[0]} attemptB={comparingAttempts[1]} />
          </div>
        ) : attempts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8 text-slate-500">
            <History className="h-12 w-12 text-slate-700 mb-3" />
            <p className="text-sm font-semibold text-slate-400">No attempts submitted yet.</p>
            <p className="text-xs text-slate-500 mt-1">Submit your first solution to track iterative improvement!</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {attempts.map((att, idx) => (
              <div
                key={att.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all hover:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 font-mono text-sm font-bold text-indigo-400 border border-indigo-500/20">
                      #{att.attemptNumber}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-200 uppercase font-mono">
                          {att.rawSubmission.formatId}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(att.createdAt).toLocaleTimeString()}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Status:{' '}
                        <span
                          className={`font-semibold ${
                            att.status === 'completed'
                              ? 'text-emerald-400'
                              : att.status === 'failed'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {att.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Score badge */}
                  {att.evaluation && (
                    <div className="flex items-center space-x-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 border border-slate-700 font-extrabold text-sm text-indigo-300">
                        {att.evaluation.score}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {idx < attempts.length - 1 && (
                    <button
                      onClick={() => handleStartDiff(att, idx)}
                      className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      <GitCompare className="h-3.5 w-3.5" />
                      <span>Compare with Prev Attempt</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onForkAndRetry(att);
                      onClose();
                    }}
                    className="flex items-center space-x-1.5 rounded-lg bg-indigo-600/20 px-3 py-1 text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all ml-auto"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Fork & Retry from Here</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
