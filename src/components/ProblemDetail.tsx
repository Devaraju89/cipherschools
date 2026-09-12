import React, { useState } from 'react';
import type { Problem } from '../domain/types';
import { BookOpen, ShieldAlert, Award, Lightbulb, Code2 } from 'lucide-react';

interface ProblemDetailProps {
  problem: Problem;
  onLoadSampleSolution?: (sample: { formatId: any; content: string }) => void;
}

export const ProblemDetail: React.FC<ProblemDetailProps> = ({ problem, onLoadSampleSolution }) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'rubric' | 'sample'>('prompt');

  return (
    <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Problem Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20 uppercase tracking-wider font-mono">
            {problem.category}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider font-mono border ${
              problem.difficulty === 'Easy'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : problem.difficulty === 'Medium'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {problem.difficulty}
          </span>
        </div>
        <h1 className="mt-2.5 text-lg font-bold text-white tracking-tight leading-snug">
          {problem.title}
        </h1>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed line-clamp-3">
          {problem.shortDescription}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-800 px-4 pt-2 pb-2 bg-slate-950/40 flex-shrink-0">
        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'prompt'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Requirements</span>
        </button>
        <button
          onClick={() => setActiveTab('rubric')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'rubric'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Rubric ({problem.rubric.length})</span>
        </button>
        {problem.sampleSolution && (
          <button
            onClick={() => setActiveTab('sample')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'sample'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Sample Output</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 text-xs text-slate-300 space-y-4">
        {activeTab === 'prompt' && (
          <div className="space-y-4">
            {/* Render prompt markdown */}
            <div className="space-y-2 leading-relaxed">
              {problem.prompt.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3
                      key={i}
                      className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono pt-2 border-b border-slate-800/60 pb-1"
                    >
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                return (
                  <p key={i} className="whitespace-pre-line text-slate-300">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Expected Domain Concepts */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 mb-2">
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Expected Key Concepts</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {problem.expectedConcepts.map((concept) => (
                  <span
                    key={concept}
                    className="rounded bg-slate-900 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-800"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-400 mb-2">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Key Constraints & Edge Cases</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {problem.constraints.map((c, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>
                      <strong className="text-slate-200 capitalize font-mono text-[10px] bg-slate-800/80 px-1 py-0.2 rounded mr-1">
                        {c.type.replace('_', ' ')}
                      </strong>{' '}
                      {c.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'rubric' && (
          <div className="space-y-3">
            {problem.rubric.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">{item.title}</span>
                  <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-400 border border-indigo-500/20">
                    Weight: {item.weight}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sample' && problem.sampleSolution && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Format: <span className="text-indigo-400 font-mono">{problem.sampleSolution.formatId}</span>
              </span>
              {onLoadSampleSolution && (
                <button
                  onClick={() => onLoadSampleSolution(problem.sampleSolution!)}
                  className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-xs"
                >
                  Load into Editor
                </button>
              )}
            </div>
            <pre className="rounded-xl bg-slate-950 p-3 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 max-h-96 leading-relaxed">
              {problem.sampleSolution.content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
