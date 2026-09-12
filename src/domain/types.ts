export type SubmissionFormatId = 'code_outline' | 'mermaid_diagram' | 'json_design' | 'text';

export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  weight: number;
  category: 'architecture' | 'solid' | 'extensibility' | 'edge_cases' | 'tradeoffs';
}

export interface ProblemConstraint {
  type: 'functional' | 'non_functional' | 'edge_case';
  text: string;
}

export interface Problem {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  shortDescription: string;
  prompt: string;
  expectedConcepts: string[];
  constraints: ProblemConstraint[];
  rubric: RubricCriterion[];
  sampleSolution?: {
    formatId: SubmissionFormatId;
    content: string;
  };
}

export interface RawSubmission {
  formatId: SubmissionFormatId;
  content: string;
  language?: string;
}

export interface ParsedClassMethod {
  name: string;
  params: string[];
  returnType: string;
}

export interface ParsedClassField {
  name: string;
  type: string;
}

export interface ParsedClass {
  name: string;
  type: 'class' | 'interface' | 'enum';
  isAbstract?: boolean;
  methods: ParsedClassMethod[];
  fields: ParsedClassField[];
  extends?: string;
  implements?: string[];
}

export interface ParsedRelationship {
  from: string;
  to: string;
  type: 'inheritance' | 'realization' | 'association' | 'aggregation' | 'composition';
  multiplicity?: string;
}

export interface ParsedSubmission {
  classes: ParsedClass[];
  relationships: ParsedRelationship[];
  notes?: string;
}

export type FeedbackSeverity = 'info' | 'warning' | 'critical' | 'pass';

export interface FeedbackItem {
  id: string;
  source: 'deterministic' | 'llm';
  criterionId: string;
  severity: FeedbackSeverity;
  title: string;
  message: string;
  evidence: string[];
  suggestion?: string;
}

export interface CriterionScore {
  criterionId: string;
  score: number; // 0 to 100
  maxScore: number;
  explanation: string;
}

export interface RadarScores {
  abstraction: number;
  solid: number;
  extensibility: number;
  edgeCases: number;
  tradeoffs: number;
}

export interface EvaluationResult {
  score: number; // Overall 0 to 100
  verdict: 'needs_work' | 'solid' | 'strong';
  radarScores: RadarScores;
  feedback: FeedbackItem[];
  criterionScores: CriterionScore[];
  strengths: string[];
  gaps: string[];
  nextSteps: string[];
}

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Attempt {
  id: string;
  problemId: string;
  attemptNumber: number;
  rawSubmission: RawSubmission;
  createdAt: string;
  status: JobStatus;
  evaluation?: EvaluationResult;
  errorMessage?: string;
}

export interface EvaluationJob {
  id: string;
  attemptId: string;
  problemId: string;
  rawSubmission: RawSubmission;
  status: JobStatus;
  progress: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
  result?: EvaluationResult;
  errorMessage?: string;
}

export interface StressTestScenario {
  id: string;
  title: string;
  description: string;
  impactRequirement: string;
  evaluationPrompt: string;
}
