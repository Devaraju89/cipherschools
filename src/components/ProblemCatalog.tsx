import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Problem, Attempt } from '../domain/types';
import {
  Search,
  Layers,
  ArrowRight,
  Sparkles,
  Code2,
  CheckCircle2,
  Clock,
  Key,
} from 'lucide-react';

interface ProblemCatalogProps {
  problems: Problem[];
  attempts: Record<string, Attempt[]>;
  onSelectProblem: (problem: Problem) => void;
  onOpenApiKeyModal: () => void;
  onOpenHistory: () => void;
}

export const ProblemCatalog: React.FC<ProblemCatalogProps> = ({
  problems,
  attempts,
  onSelectProblem,
  onOpenApiKeyModal,
  onOpenHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'attempted' | 'unattempted'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener to focus search on '/' or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) &&
          document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute stats across all problems
  const stats = useMemo(() => {
    let totalAttemptsCount = 0;
    let completedProblemsCount = 0;

    problems.forEach((p) => {
      const atts = attempts[p.id] || [];
      totalAttemptsCount += atts.length;
      if (atts.some((a) => a.status === 'completed')) {
        completedProblemsCount += 1;
      }
    });

    return {
      totalProblems: problems.length,
      totalAttemptsCount,
      completedProblemsCount,
    };
  }, [problems, attempts]);

  // Filter problems based on search, difficulty, and status
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        problem.title.toLowerCase().includes(q) ||
        problem.shortDescription.toLowerCase().includes(q) ||
        problem.category.toLowerCase().includes(q) ||
        problem.expectedConcepts.some((c) => c.toLowerCase().includes(q));

      const matchesDifficulty =
        difficultyFilter === 'All' || problem.difficulty === difficultyFilter;

      const problemAttempts = attempts[problem.id] || [];
      const isAttempted = problemAttempts.length > 0;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'attempted' && isAttempted) ||
        (statusFilter === 'unattempted' && !isAttempted);

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [problems, searchQuery, difficultyFilter, statusFilter, attempts]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative border-b border-slate-800/80 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Eyebrow & AI Config Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Low-Level Design Practice Platform</span>
            </div>

            <button
              onClick={onOpenApiKeyModal}
              className="inline-flex items-center space-x-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs font-medium text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
            >
              <Key className="h-3 w-3 text-amber-400" />
              <span>Configure AI Evaluator</span>
            </button>
          </div>

          {/* Main Title & Subhead */}
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Build. Submit.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Get Evaluated.
              </span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
              Sharpen your Object-Oriented design skills for tech interviews. Formulate class hierarchies,
              abstract core interfaces, and receive instant, explainable feedback via deterministic AST analysis and AI reasoning.
            </p>
          </div>

          {/* Value Props & Stat Pills */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold">
                <Layers className="h-4 w-4" />
                <span>Curated Problems</span>
              </div>
              <p className="mt-1 text-xl font-bold text-white">{stats.totalProblems}</p>
              <p className="text-[11px] text-slate-500">Real interview scenarios</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Completed</span>
              </div>
              <p className="mt-1 text-xl font-bold text-white">
                {stats.completedProblemsCount} / {stats.totalProblems}
              </p>
              <p className="text-[11px] text-slate-500">Solved at least once</p>
            </div>

            <div
              onClick={onOpenHistory}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 cursor-pointer hover:border-slate-700 transition-colors"
              title="Click to view full attempt history"
            >
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold">
                <Clock className="h-4 w-4" />
                <span>Total Attempts</span>
              </div>
              <p className="mt-1 text-xl font-bold text-white">{stats.totalAttemptsCount}</p>
              <p className="text-[11px] text-slate-500 hover:text-slate-300">Click to view history →</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold">
                <Code2 className="h-4 w-4" />
                <span>Submission Modes</span>
              </div>
              <p className="mt-1 text-xl font-bold text-white">4 Formats</p>
              <p className="text-[11px] text-slate-500">Code, Mermaid, JSON, Text</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Body */}
      <section id="problems-grid" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filters Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems, concepts, or patterns... (Press / to focus)"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-12 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                /
              </kbd>
            )}
          </div>

          {/* Filters: Difficulty & Status */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Difficulty Tabs */}
            <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`rounded-md px-3 py-1 font-semibold transition-all ${
                    difficultyFilter === diff
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`rounded-md px-3 py-1 font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('attempted')}
                className={`rounded-md px-3 py-1 font-semibold transition-all ${
                  statusFilter === 'attempted'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Attempted
              </button>
              <button
                onClick={() => setStatusFilter('unattempted')}
                className={`rounded-md px-3 py-1 font-semibold transition-all ${
                  statusFilter === 'unattempted'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Not Started
              </button>
            </div>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-400 py-4">
          <span>
            Showing <strong className="text-slate-200">{filteredProblems.length}</strong> of{' '}
            <strong className="text-slate-200">{problems.length}</strong> problems
          </span>
          {(searchQuery || difficultyFilter !== 'All' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setDifficultyFilter('All');
                setStatusFilter('all');
              }}
              className="text-indigo-400 hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Problem Cards Grid */}
        {filteredProblems.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center my-8">
            <Search className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">No matching problems found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or relaxing your difficulty and status filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((problem) => {
              const problemAttempts = attempts[problem.id] || [];
              const attemptCount = problemAttempts.length;
              const isAttempted = attemptCount > 0;
              const bestScore = problemAttempts.reduce((max, a) => {
                return a.evaluation?.score !== undefined ? Math.max(max, a.evaluation.score) : max;
              }, -1);

              return (
                <div
                  key={problem.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/5 backdrop-blur-sm"
                >
                  <div>
                    {/* Header: Category & Difficulty Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-semibold text-indigo-300 border border-slate-700/60 uppercase tracking-wider font-mono">
                        {problem.category}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${
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

                    {/* Problem Title */}
                    <h3 className="mt-3 text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {problem.title}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {problem.shortDescription}
                    </p>

                    {/* Expected Key Concepts */}
                    <div className="mt-4 pt-3 border-t border-slate-800/60">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                        Expected Patterns & Concepts:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {problem.expectedConcepts.slice(0, 4).map((concept) => (
                          <span
                            key={concept}
                            className="rounded bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-800"
                          >
                            {concept}
                          </span>
                        ))}
                        {problem.expectedConcepts.length > 4 && (
                          <span className="rounded bg-slate-950 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 border border-slate-800">
                            +{problem.expectedConcepts.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Attempts & CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      {isAttempted ? (
                        <div className="flex items-center space-x-2">
                          <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-400 font-mono">
                            {attemptCount} {attemptCount === 1 ? 'Attempt' : 'Attempts'}
                          </span>
                          {bestScore >= 0 && (
                            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20 font-mono">
                              Best: {bestScore}/100
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500">
                          Not started yet
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectProblem(problem)}
                      className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-sm ${
                        isAttempted
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 shadow-md'
                      }`}
                    >
                      <span>{isAttempted ? 'Continue' : 'Solve Challenge'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Practice Loop Flow Explanation */}
        <div className="mt-16 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/60 via-indigo-950/20 to-slate-900/60 p-6 sm:p-8">
          <div className="max-w-2xl">
            <span className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-[11px] font-bold text-indigo-400 uppercase tracking-wider font-mono">
              The Practice Loop
            </span>
            <h2 className="mt-2 text-xl font-bold text-white">How LLD Workbench Works</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Low-Level Design is best learned through rapid, feedback-driven iteration. Here is how your design evolves:
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-400 font-mono mb-2">
                01
              </span>
              <h4 className="text-xs font-bold text-slate-200">Choose Problem</h4>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                Pick from real-world concurrency, state machine, and resource management challenges.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-400 font-mono mb-2">
                02
              </span>
              <h4 className="text-xs font-bold text-slate-200">Model & Code</h4>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                Submit in TypeScript code outline, Mermaid class diagrams, JSON schema, or plain text.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-400 font-mono mb-2">
                03
              </span>
              <h4 className="text-xs font-bold text-slate-200">Instant Evaluation</h4>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                Get an objective rubric scorecard combining deterministic AST checks with AI reasoning.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-400 font-mono mb-2">
                04
              </span>
              <h4 className="text-xs font-bold text-slate-200">Refine & Iterate</h4>
              <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                Address critical architectural gaps and watch your rubric radar expand across attempts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
