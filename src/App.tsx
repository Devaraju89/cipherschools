import React, { useState, useEffect, useMemo } from 'react';
import { LLD_PROBLEMS } from './data/problems';
import type { Problem, RawSubmission, Attempt, EvaluationResult } from './domain/types';
import { EvaluationOrchestrator } from './domain/evaluators/EvaluationOrchestrator';
import { Navbar } from './components/Navbar';
import { ProblemDetail } from './components/ProblemDetail';
import { MultiFormatEditor } from './components/Editor/MultiFormatEditor';
import { FeedbackDashboard } from './components/Feedback/FeedbackDashboard';
import { AttemptHistoryDrawer } from './components/History/AttemptHistoryDrawer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ProblemCatalog } from './components/ProblemCatalog';

export type AppScreen = 'catalog' | 'editor' | 'feedback' | 'history';

export const App: React.FC = () => {
  const [problems] = useState<Problem[]>(LLD_PROBLEMS);
  const [activeProblem, setActiveProblem] = useState<Problem>(LLD_PROBLEMS[0]);

  const [rawSubmission, setRawSubmission] = useState<RawSubmission>({
    formatId: 'code_outline',
    content: LLD_PROBLEMS[0].sampleSolution?.content || '',
  });

  const [attempts, setAttempts] = useState<Record<string, Attempt[]>>(() => {
    try {
      const stored = localStorage.getItem('lld_attempts_history');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [activeEvaluation, setActiveEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('catalog');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Sync attempts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lld_attempts_history', JSON.stringify(attempts));
    } catch (e) {
      console.warn('Failed to persist attempts to localStorage', e);
    }
  }, [attempts]);

  const problemAttempts = attempts[activeProblem.id] || [];

  const totalAttemptsCount = useMemo(() => {
    return Object.values(attempts).reduce((sum, attList) => sum + attList.length, 0);
  }, [attempts]);

  const handleSelectProblem = (problem: Problem) => {
    setActiveProblem(problem);
    const existing = attempts[problem.id] || [];
    if (existing.length > 0) {
      const latest = existing[0];
      setRawSubmission(latest.rawSubmission);
      if (latest.evaluation) {
        setActiveEvaluation(latest.evaluation);
        setCurrentScreen('feedback');
      } else {
        setCurrentScreen('editor');
      }
    } else {
      setRawSubmission({
        formatId: problem.sampleSolution?.formatId || 'code_outline',
        content: problem.sampleSolution?.content || '',
      });
      setActiveEvaluation(null);
      setCurrentScreen('editor');
    }
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    try {
      const orchestrator = new EvaluationOrchestrator();
      const result = await orchestrator.runEvaluation(activeProblem, rawSubmission);

      const newAttempt: Attempt = {
        id: `att_${Date.now()}`,
        problemId: activeProblem.id,
        attemptNumber: (attempts[activeProblem.id]?.length || 0) + 1,
        rawSubmission: { ...rawSubmission },
        createdAt: new Date().toISOString(),
        status: 'completed',
        evaluation: result,
      };

      setAttempts((prev) => ({
        ...prev,
        [activeProblem.id]: [newAttempt, ...(prev[activeProblem.id] || [])],
      }));

      setActiveEvaluation(result);
      setCurrentScreen('feedback');
    } catch (err: any) {
      console.error('Evaluation failed:', err);
      alert('Evaluation failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleForkAndRetry = (attempt: Attempt) => {
    setRawSubmission({ ...attempt.rawSubmission });
    setCurrentScreen('editor');
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        problems={problems}
        activeProblem={activeProblem}
        onSelectProblem={handleSelectProblem}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        attemptCount={currentScreen === 'catalog' ? totalAttemptsCount : problemAttempts.length}
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          if (screen === 'history') {
            setIsHistoryOpen(true);
          } else {
            setCurrentScreen(screen);
          }
        }}
      />

      {/* Screen Views */}
      {currentScreen === 'catalog' ? (
        <ProblemCatalog
          problems={problems}
          attempts={attempts}
          onSelectProblem={handleSelectProblem}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />
      ) : currentScreen === 'feedback' && activeEvaluation ? (
        <FeedbackDashboard
          problem={activeProblem}
          evaluation={activeEvaluation}
          onRetry={() => setCurrentScreen('editor')}
          submission={rawSubmission}
          attemptNumber={problemAttempts.length}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onNavigateCatalog={() => setCurrentScreen('catalog')}
        />
      ) : (
        /* Main Workspace View */
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {/* Workspace Subheader: Breadcrumb, Attempt Draft Badge & View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900/70 border-b border-slate-800 flex-shrink-0 text-xs">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentScreen('catalog')}
                className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1 font-medium"
              >
                <span>Problems</span>
              </button>
              <span className="text-slate-600">/</span>
              <span className="font-bold text-slate-200">{activeProblem.title}</span>
            </div>

            {/* Real Attempt Draft Status Chip */}
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-slate-800/90 px-3 py-0.5 text-[11px] font-semibold text-slate-300 border border-slate-700/70 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Attempt #{problemAttempts.length + 1} • Draft</span>
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1 rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setCurrentScreen('editor')}
                  className={`rounded-md px-3 py-1 transition-all ${
                    currentScreen === 'editor'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => activeEvaluation && setCurrentScreen('feedback')}
                  disabled={!activeEvaluation}
                  className={`rounded-md px-3 py-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    currentScreen === 'feedback'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Evaluation Feedback {activeEvaluation ? `(${activeEvaluation.score}/100)` : ''}
                </button>
              </div>
            </div>
          </div>

          {/* Main Workspace Split Layout */}
          <main className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden p-3 sm:p-4 gap-3 sm:gap-4">
            {/* Left Column: Problem Requirements */}
            <section className="w-full lg:w-[380px] xl:w-[400px] flex flex-col min-h-0 flex-shrink-0">
              <ProblemDetail
                problem={activeProblem}
                onLoadSampleSolution={(sample) => {
                  setRawSubmission(sample);
                  setCurrentScreen('editor');
                }}
              />
            </section>

            {/* Right Column: Editor */}
            <section className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-hidden">
                <MultiFormatEditor
                  submission={rawSubmission}
                  onChange={setRawSubmission}
                  onSubmit={handleSubmit}
                  isEvaluating={isEvaluating}
                  problemId={activeProblem.id}
                />
              </div>
            </section>
          </main>
        </div>
      )}

      {/* Attempt History Drawer */}
      <AttemptHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        attempts={problemAttempts}
        onForkAndRetry={handleForkAndRetry}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};

export default App;
