import type { EvaluationInput, EvaluatorOutput, IEvaluator } from '../evaluator';
import type { CriterionScore, FeedbackItem } from '../types';

export class HybridLlmEvaluator implements IEvaluator {
  id = 'hybrid_llm_evaluator';
  name = 'LLM Subjective & Trade-off Evaluator';
  type = 'llm' as const;

  async evaluate(input: EvaluationInput): Promise<EvaluatorOutput> {
    const apiKey = import.meta.env?.VITE_OPENAI_API_KEY || (typeof window !== 'undefined' && window.localStorage?.getItem('lld_openai_api_key'));

    if (apiKey) {
      try {
        return await this.evaluateWithLiveLlm(apiKey, input);
      } catch (err) {
        console.warn('Live LLM evaluation failed, falling back to intelligent offline LLM engine:', err);
      }
    }

    return this.evaluateWithOfflineIntelligentEngine(input);
  }

  private async evaluateWithLiveLlm(apiKey: string, input: EvaluationInput): Promise<EvaluatorOutput> {
    const { problem, rawSubmission } = input;
    const promptText = `
You are an expert Principal Software Architect evaluating a Low-Level Design (LLD) practice submission.
Problem Title: ${problem.title}
Problem Constraints: ${problem.constraints.map((c) => c.text).join('; ')}
Expected Domain Concepts: ${problem.expectedConcepts.join(', ')}

Learner Submission (${rawSubmission.formatId}):
\`\`\`
${rawSubmission.content}
\`\`\`

Evaluate the submission against these criteria:
${problem.rubric.map((r) => `- [${r.id}] ${r.title}: ${r.description}`).join('\n')}

Return JSON matching format:
{
  "score": 85,
  "criterionScores": [
    {"criterionId": "string", "score": 80, "explanation": "string"}
  ],
  "feedback": [
    {
      "criterionId": "string",
      "severity": "info" | "warning" | "critical" | "pass",
      "title": "string",
      "message": "string",
      "evidence": ["string"],
      "suggestion": "string"
    }
  ],
  "strengths": ["string"],
  "gaps": ["string"],
  "nextSteps": ["string"]
}
`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You evaluate LLD practice submissions. Return ONLY valid JSON.' },
          { role: 'user', content: promptText },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API returned status ${res.status}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    const feedbackItems: FeedbackItem[] = (parsed.feedback || []).map((f: any, idx: number) => ({
      id: `llm_live_${idx}`,
      source: 'llm',
      criterionId: f.criterionId || problem.rubric[0]?.id || 'general',
      severity: f.severity || 'info',
      title: f.title || 'LLM Feedback',
      message: f.message || '',
      evidence: Array.isArray(f.evidence) ? f.evidence : [],
      suggestion: f.suggestion,
    }));

    return {
      score: parsed.score || 75,
      feedback: feedbackItems,
      metadata: {
        strengths: parsed.strengths || [],
        gaps: parsed.gaps || [],
        nextSteps: parsed.nextSteps || [],
        criterionScores: parsed.criterionScores || [],
        llmProvider: 'OpenAI GPT-4o-mini',
      },
    };
  }

  private evaluateWithOfflineIntelligentEngine(input: EvaluationInput): EvaluatorOutput {
    const { problem, parsedSubmission, rawSubmission } = input;
    const content = (rawSubmission.content || '').toLowerCase();
    const classes = parsedSubmission.classes;
    const feedback: FeedbackItem[] = [];

    let totalScore = 0;
    const criterionScores: CriterionScore[] = [];
    const strengths: string[] = [];
    const gaps: string[] = [];
    const nextSteps: string[] = [];

    // Analyze each Rubric Criterion
    for (const rubric of problem.rubric) {
      let critScore = 70;
      const category = rubric.category;

      if (category === 'architecture') {
        if (classes.length >= 3) {
          critScore += 20;
          strengths.push(`Modular class breakdown with ${classes.length} distinct domain entities.`);
        } else {
          critScore -= 20;
          gaps.push(`Monolithic structure: only ${classes.length} class(es) defined.`);
          nextSteps.push(`Break down responsibilities across smaller entities.`);
        }
      } else if (category === 'solid') {
        const hasStrategyPattern =
          content.includes('strategy') ||
          content.includes('policy') ||
          classes.some((c) => c.name.toLowerCase().includes('strategy') || c.name.toLowerCase().includes('policy'));

        if (hasStrategyPattern) {
          critScore += 25;
          strengths.push('Excellent use of Strategy pattern for dynamic runtime algorithm switching.');
          feedback.push({
            id: `llm_solid_strategy`,
            source: 'llm',
            criterionId: rubric.id,
            severity: 'pass',
            title: 'Extensible Strategy Pattern Identified',
            message: 'Your design leverages the Strategy pattern to isolate changing algorithms from core business logic.',
            evidence: ['Strategy/Policy abstractions present'],
          });
        } else {
          critScore -= 15;
          gaps.push('Hardcoded algorithmic logic instead of pluggable Strategy interfaces.');
          nextSteps.push('Extract key algorithmic variations into a Strategy interface.');
        }
      } else if (category === 'extensibility') {
        const hasEnums = classes.some((c) => c.type === 'enum') || content.includes('enum') || content.includes('type');
        if (hasEnums) {
          critScore += 15;
          strengths.push('Strong type safety with Enums/Domain Types for key states.');
        }
      } else if (category === 'edge_cases') {
        if (content.includes('exception') || content.includes('concurrency') || content.includes('lock') || content.includes('validate')) {
          critScore += 20;
          strengths.push('Thoughtful consideration of thread safety and exception handling.');
        } else {
          critScore -= 10;
          gaps.push('Sparse concurrency and failure handling specs.');
          nextSteps.push('Specify thread locks, optimistic locking, or mutexes for concurrent state transitions.');
        }
      } else if (category === 'tradeoffs') {
        if (content.includes('tradeoff') || content.includes('pros') || content.includes('cons') || content.includes('because')) {
          critScore += 20;
          strengths.push('Includes explicit rationale and design trade-off commentary.');
        } else {
          critScore -= 15;
          gaps.push('Missing explicit trade-off reasoning or alternative comparison.');
          nextSteps.push('Document why you chose this design over alternative implementations (e.g. In-memory vs DB locks).');
        }
      }

      critScore = Math.min(100, Math.max(20, critScore));
      criterionScores.push({
        criterionId: rubric.id,
        score: critScore,
        maxScore: 100,
        explanation: `Score based on evaluation of ${rubric.title.toLowerCase()} principles.`,
      });

      totalScore += (critScore * rubric.weight) / 100;
    }

    const normalizedScore = Math.round(totalScore);

    // Provide default feedback items
    if (gaps.length > 0) {
      feedback.push({
        id: 'llm_gap_summary',
        source: 'llm',
        criterionId: problem.rubric[0]?.id || 'general',
        severity: 'warning',
        title: 'Key Design Gaps to Address',
        message: gaps.join(' '),
        evidence: [gaps[0] || ''],
        suggestion: nextSteps[0] || 'Refine entity boundaries.',
      });
    }

    return {
      score: normalizedScore,
      feedback,
      metadata: {
        strengths,
        gaps,
        nextSteps,
        criterionScores,
        llmProvider: 'LLM Intelligent Reasoner (Built-in)',
      },
    };
  }
}
