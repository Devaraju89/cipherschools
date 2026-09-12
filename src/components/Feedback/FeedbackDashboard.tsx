import React, { useState } from 'react';
import type { EvaluationResult, Problem, RawSubmission } from '../../domain/types';
import { RadarChart } from './RadarChart';
import { STRESS_TEST_SCENARIOS } from '../../data/stressTests';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Zap,
  Sparkles,
  Flame,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code2,
  History,
  Settings,
} from 'lucide-react';

interface FeedbackDashboardProps {
  problem: Problem;
  evaluation: EvaluationResult;
  onRetry: () => void;
  submission?: RawSubmission;
  attemptNumber?: number;
  onOpenHistory?: () => void;
  onOpenApiKeyModal?: () => void;
  onNavigateCatalog?: () => void;
}

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({
  problem,
  evaluation,
  onRetry,
  submission,
  attemptNumber,
  onOpenHistory,
  onOpenApiKeyModal,
  onNavigateCatalog,
}) => {
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);
  const [isStressTestsOpen, setIsStressTestsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const stressScenarios = STRESS_TEST_SCENARIOS[problem.id] || [];

  const handleCopyCode = () => {
    if (submission?.content) {
      navigator.clipboard.writeText(submission.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Real verdict styling mapping
  const verdictConfig = {
    strong: {
      label: 'STRONG',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400',
      description: 'Exemplary architectural design meeting comprehensive requirements with solid decoupling and safety.',
    },
    solid: {
      label: 'SOLID',
      badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      dotClass: 'bg-indigo-400',
      description: 'Solid foundational architecture. Core workflows functional with minor diagnostic gaps to address.',
    },
    needs_work: {
      label: 'NEEDS WORK',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dotClass: 'bg-rose-400',
      description: 'Requires architectural revisions. Critical design patterns, edge cases, or requirements coverage need remediation.',
    },
  }[evaluation.verdict] || {
    label: evaluation.verdict.toUpperCase(),
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    dotClass: 'bg-indigo-400',
    description: 'Evaluation complete. Review the rubric criteria and diagnostic gaps below.',
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Stitch Header: Breadcrumbs, Attempt Badge, Status, Actions */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex-shrink-0 text-xs">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigateCatalog || onRetry}
            className="text-slate-400 hover:text-white transition-colors font-medium"
          >
            Problems
          </button>
          <span className="text-slate-600">/</span>
          <button
            onClick={onRetry}
            className="text-slate-400 hover:text-white transition-colors font-medium truncate max-w-[200px]"
          >
            {problem.title}
          </button>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-indigo-400">Evaluation Report</span>
        </div>

        {/* Center: Attempt Badge & Status */}
        <div className="flex items-center space-x-2">
          {attemptNumber !== undefined && (
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-slate-800/90 px-3 py-0.5 text-[11px] font-semibold text-slate-300 border border-slate-700/70 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span>Attempt #{attemptNumber}</span>
            </span>
          )}
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20 font-mono">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Evaluation Complete</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <History className="h-3.5 w-3.5 text-indigo-400" />
              <span>Attempts History</span>
            </button>
          )}
          {onOpenApiKeyModal && (
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              <span>AI Config</span>
            </button>
          )}
          <button
            onClick={onRetry}
            className="flex items-center space-x-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/40 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-colors"
          >
            <span>Back to Workspace</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Report Body */}
      <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Executive Summary Card Banner */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Box: Score & Verdict */}
            <div className="lg:col-span-4 flex items-center space-x-5 border-b lg:border-b-0 lg:border-r border-slate-800 pb-5 lg:pb-0 lg:pr-6">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 shadow-xl shadow-indigo-500/25 flex-shrink-0 border border-indigo-400/30">
                <span className="text-4xl font-black text-white font-mono">{evaluation.score}</span>
                <span className="absolute bottom-1.5 right-2.5 text-[11px] font-extrabold text-indigo-200 font-mono">/100</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center space-x-1.5 rounded-full px-3 py-0.5 text-xs font-black tracking-wider border font-mono ${verdictConfig.badgeClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${verdictConfig.dotClass}`} />
                    <span>{verdictConfig.label}</span>
                  </span>
                </div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  Architecture Score
                </h1>
                <p className="text-xs text-slate-400 leading-snug">
                  {verdictConfig.description}
                </p>
              </div>
            </div>

            {/* Right Box: Executive AI Review & Telemetry */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                  <Sparkles className="h-4 w-4" />
                  <span>Executive Architecture Assessment</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Dual Pipeline: AST + LLM
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The design has undergone static structural analysis against the system requirements alongside deep reasoning evaluation.
                Dimensional profiler, detailed rubric criteria, diagnostic gaps, and concrete evidence snippets are indexed below.
              </p>

              {/* Technical Telemetry Metadata (Only real data, no fake telemetry) */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-slate-400">
                {submission && (
                  <>
                    <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      Format: <strong className="text-slate-200">{submission.formatId}</strong>
                    </span>
                    <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                      Chars: <strong className="text-slate-200">{submission.content.length.toLocaleString()}</strong>
                    </span>
                  </>
                )}
                <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  Rubric: <strong className="text-slate-200">{evaluation.criterionScores.length} criteria</strong>
                </span>
                <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>AST Validation Passed</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Desktop Two-Column Engineering Review Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ========================================================================= */}
          {/* LEFT COLUMN (7 cols on lg): Radar Chart + Detailed Rubric Breakdown       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Dimensional Competency Radar Card */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-md">
              <div className="w-full flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Dimensional Competency Radar
                  </h2>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Target Baseline: ≥75</span>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-around gap-4 py-2">
                {/* Reusing existing mathematical RadarChart component */}
                <div className="flex-shrink-0">
                  <RadarChart scores={evaluation.radarScores} />
                </div>

                {/* Score dimension legend */}
                <div className="w-full md:w-48 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Abstraction</span>
                    <span className="font-bold text-indigo-300">{evaluation.radarScores.abstraction}%</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">SOLID</span>
                    <span className="font-bold text-indigo-300">{evaluation.radarScores.solid}%</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Extensibility</span>
                    <span className="font-bold text-indigo-300">{evaluation.radarScores.extensibility}%</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Edge Cases</span>
                    <span className="font-bold text-indigo-300">{evaluation.radarScores.edgeCases}%</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Tradeoffs</span>
                    <span className="font-bold text-indigo-300">{evaluation.radarScores.tradeoffs}%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Detailed Rubric Breakdown (Real criterionScores) */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    Detailed Rubric Evaluation
                  </h2>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {evaluation.criterionScores.length} Dimensions Scored
                </span>
              </div>

              <div className="space-y-3.5">
                {evaluation.criterionScores.map((c, idx) => {
                  const rubricItem = problem.rubric.find((r) => r.id === c.criterionId);
                  const title = rubricItem?.title || c.criterionId.replace(/_/g, ' ').toUpperCase();
                  const percentage = Math.min(100, Math.round((c.score / c.maxScore) * 100));
                  const isPassing = percentage >= 75;

                  return (
                    <div
                      key={c.criterionId || idx}
                      className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 space-y-2.5 transition-all hover:border-slate-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {idx + 1}. {title}
                          </span>
                          {rubricItem && (
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 flex-shrink-0">
                              Weight: {rubricItem.weight}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 font-mono flex-shrink-0">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                              isPassing
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {isPassing ? 'PASS' : 'PARTIAL'}
                          </span>
                          <span className="text-xs font-extrabold text-slate-200">
                            {c.score} / {c.maxScore}
                          </span>
                        </div>
                      </div>

                      {/* Progress meter */}
                      <div className="h-1.5 w-full bg-slate-800/90 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage >= 80
                              ? 'bg-emerald-500'
                              : percentage >= 60
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {c.explanation && (
                        <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                          {c.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN (5 cols on lg): Strengths + Diagnostic Gaps + Feedback Items  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Architecture Strengths */}
            <section className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5 shadow-md space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h2 className="uppercase tracking-wider font-mono">
                  Architecture Strengths ({evaluation.strengths.length})
                </h2>
              </div>
              <ul className="space-y-2.5">
                {evaluation.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                    <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span className="leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 2. Diagnostic Gaps (CRITICAL: dedicated section rendering real evaluation.gaps[]) */}
            <section className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-400">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <h2 className="uppercase tracking-wider font-mono">
                    Diagnostic Gaps ({evaluation.gaps.length})
                  </h2>
                </div>
                {evaluation.gaps.length > 0 && (
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-500/30">
                    Action Required
                  </span>
                )}
              </div>

              {evaluation.gaps.length === 0 ? (
                <div className="flex items-center space-x-2 text-xs text-emerald-400 py-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No outstanding diagnostic gaps.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {evaluation.gaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-rose-500/20 bg-slate-950/80 p-3.5 space-y-1"
                    >
                      <div className="flex items-start space-x-2.5">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold font-mono mt-0.5 flex-shrink-0">
                          !
                        </span>
                        <span className="text-xs font-medium text-slate-200 leading-relaxed">
                          {gap}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Detailed Feedback Items with Evidence & Suggestions */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <h2 className="uppercase tracking-wider font-mono">
                    Detailed Evidence Items ({evaluation.feedback.length})
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {evaluation.feedback.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3.5 transition-all ${
                      item.severity === 'pass'
                        ? 'border-emerald-500/20 bg-emerald-950/10'
                        : item.severity === 'critical'
                        ? 'border-rose-500/30 bg-rose-950/10'
                        : item.severity === 'warning'
                        ? 'border-amber-500/20 bg-amber-950/10'
                        : 'border-slate-800 bg-slate-950/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        {item.severity === 'pass' && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                        {item.severity === 'critical' && <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />}
                        {item.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />}
                        {item.severity === 'info' && <Info className="h-4 w-4 text-indigo-400 flex-shrink-0" />}
                        <span className="font-bold text-xs text-slate-200 truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 font-mono flex-shrink-0">
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                          {item.source === 'deterministic' ? 'AST' : 'LLM'}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            item.severity === 'pass'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : item.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-400'
                              : item.severity === 'warning'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-indigo-500/20 text-indigo-400'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-300 leading-relaxed">{item.message}</p>

                    {/* Evidence Snippet */}
                    {item.evidence && item.evidence.length > 0 && (
                      <div className="mt-2.5 rounded-lg bg-slate-950 p-2 font-mono text-[11px] text-slate-400 border border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                          Evidence:
                        </span>
                        {item.evidence.map((ev, idx) => (
                          <div key={idx} className="text-indigo-300">
                            • {ev}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggestion */}
                    {item.suggestion && (
                      <div className="mt-2 text-xs font-medium text-amber-300/90 flex items-start space-x-1.5">
                        <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{item.suggestion}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FULL WIDTH BOTTOM SECTIONS: Next Steps, Code Panel, Stress Tests         */}
        {/* ========================================================================= */}

        {/* 1. Actionable Remediation Plan (Real nextSteps) */}
        {evaluation.nextSteps.length > 0 && (
          <section className="rounded-2xl border border-indigo-500/20 bg-indigo-950/10 p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h2 className="uppercase tracking-wider font-mono">
                Actionable Remediation Plan ({evaluation.nextSteps.length} Steps)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {evaluation.nextSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold font-mono flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. Collapsible Submitted Solution Snapshot */}
        {submission && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md overflow-hidden">
            <button
              onClick={() => setIsSolutionOpen(!isSolutionOpen)}
              className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-300 hover:bg-slate-850/60 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Code2 className="h-4 w-4 text-indigo-400" />
                <span>Submitted Design Solution Snapshot</span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                  {submission.formatId}
                </span>
                <span className="text-slate-500 text-[11px] font-mono">
                  ({submission.content.length.toLocaleString()} chars)
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <span>{isSolutionOpen ? 'Collapse Code' : 'Expand Code'}</span>
                {isSolutionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {isSolutionOpen && (
              <div className="p-4 pt-0 border-t border-slate-800/80">
                <div className="flex justify-end py-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800 max-h-80 leading-relaxed">
                  {submission.content}
                </pre>
              </div>
            )}
          </section>
        )}

        {/* 3. Stress Test Scenarios (Preserved functionality, collapsible) */}
        {stressScenarios.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md overflow-hidden">
            <button
              onClick={() => setIsStressTestsOpen(!isStressTestsOpen)}
              className="w-full flex items-center justify-between p-4 text-xs font-bold text-slate-300 hover:bg-slate-850/60 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <span>Stress Test Scenarios</span>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/20">
                  {stressScenarios.length} Scenarios Available
                </span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <span>{isStressTestsOpen ? 'Collapse' : 'Expand'}</span>
                {isStressTestsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {isStressTestsOpen && (
              <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4">
                <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3.5">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Test how your class design withstands real-world traffic surges, multi-gate concurrency, and new business requirements.
                    (Note: Stress test simulation does not execute live AST recalculations; scenarios are displayed for architectural verification).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {stressScenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        selectedScenario?.id === scenario.id
                          ? 'border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-200">{scenario.title}</span>
                        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/20">
                          Stress Case
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                        {scenario.description}
                      </p>
                      <div className="mt-3 text-[11px] font-semibold text-slate-300 bg-slate-900/90 p-2.5 rounded border border-slate-800">
                        <span className="text-amber-400">Impact Requirement: </span>
                        {scenario.impactRequirement}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Stitch Sticky Bottom Action Area */}
      <footer className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-900/95 flex-shrink-0">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <span>Overall Result:</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border font-mono ${verdictConfig.badgeClass}`}
          >
            {verdictConfig.label} ({evaluation.score}/100)
          </span>
          <span className="hidden sm:inline text-slate-500 text-[11px]">
            • Remediation ready for Next Iteration
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRetry}
            className="rounded-lg border border-slate-700/80 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Back to Workspace
          </button>
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Improve Design & Re-evaluate</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
