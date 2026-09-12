import type { IEvaluator } from '../evaluator';
import { getFormatParser } from '../formats';
import type {
  EvaluationResult,
  JobStatus,
  Problem,
  RadarScores,
  RawSubmission,
} from '../types';
import { ASTDeterministicEvaluator } from './ASTDeterministicEvaluator';
import { HybridLlmEvaluator } from './HybridLlmEvaluator';

export class EvaluationOrchestrator {
  private evaluators: IEvaluator[];

  constructor(evaluators?: IEvaluator[]) {
    this.evaluators = evaluators || [
      new ASTDeterministicEvaluator(),
      new HybridLlmEvaluator(),
    ];
  }

  async runEvaluation(
    problem: Problem,
    rawSubmission: RawSubmission,
    onProgress?: (progress: number, status: JobStatus) => void
  ): Promise<EvaluationResult> {
    onProgress?.(10, 'running');

    // 1. Parse raw submission into structured domain model
    const parser = getFormatParser(rawSubmission.formatId);
    const parsedSubmission = parser.parse(rawSubmission);
    onProgress?.(30, 'running');

    // 2. Run evaluators concurrently
    const [detResult, llmResult] = await Promise.all([
      this.evaluators[0].evaluate({ problem, rawSubmission, parsedSubmission }),
      this.evaluators[1].evaluate({ problem, rawSubmission, parsedSubmission }),
    ]);
    onProgress?.(80, 'running');

    // 3. Aggregate feedback and scores
    const combinedFeedback = [...detResult.feedback, ...llmResult.feedback];

    // Combine score with 40% weight on AST deterministic checks, 60% on LLM reasoning
    const weightedScore = Math.round(detResult.score * 0.4 + llmResult.score * 0.6);

    const verdict: EvaluationResult['verdict'] =
      weightedScore >= 80 ? 'strong' : weightedScore >= 60 ? 'solid' : 'needs_work';

    // Calculate Radar scores
    const radarScores: RadarScores = {
      abstraction: Math.min(100, Math.round(detResult.score * 0.9 + 10)),
      solid: Math.min(100, Math.round((llmResult.metadata?.criterionScores as any[])?.find((c) => c.criterionId.includes('solid'))?.score || 70)),
      extensibility: Math.min(100, Math.round(weightedScore * 0.95)),
      edgeCases: Math.min(100, Math.round(detResult.score * 0.85)),
      tradeoffs: Math.min(100, Math.round((llmResult.metadata?.criterionScores as any[])?.find((c) => c.criterionId.includes('tradeoff'))?.score || 65)),
    };

    const result: EvaluationResult = {
      score: weightedScore,
      verdict,
      radarScores,
      feedback: combinedFeedback,
      criterionScores: (llmResult.metadata?.criterionScores as any[]) || [
        { criterionId: 'c1', score: weightedScore, maxScore: 100, explanation: 'Overall evaluation score' },
      ],
      strengths: (llmResult.metadata?.strengths as string[]) || ['Clean structure'],
      gaps: (llmResult.metadata?.gaps as string[]) || ['Add more concurrency details'],
      nextSteps: (llmResult.metadata?.nextSteps as string[]) || ['Refine interface boundaries'],
    };

    onProgress?.(100, 'completed');
    return result;
  }
}
