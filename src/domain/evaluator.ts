import type {
  Problem,
  RawSubmission,
  ParsedSubmission,
  FeedbackItem,
  SubmissionFormatId,
} from './types';

export interface ISubmissionFormat {
  id: SubmissionFormatId;
  name: string;
  description: string;
  parse(raw: RawSubmission): ParsedSubmission;
}

export interface EvaluationInput {
  problem: Problem;
  rawSubmission: RawSubmission;
  parsedSubmission: ParsedSubmission;
}

export interface EvaluatorOutput {
  score: number; // 0..100
  feedback: FeedbackItem[];
  metadata?: Record<string, unknown>;
}

export interface IEvaluator {
  id: string;
  name: string;
  type: 'deterministic' | 'llm';
  evaluate(input: EvaluationInput): Promise<EvaluatorOutput>;
}
