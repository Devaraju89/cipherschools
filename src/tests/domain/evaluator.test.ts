import { describe, it, expect } from 'vitest';
import { ASTDeterministicEvaluator } from '../../domain/evaluators/ASTDeterministicEvaluator';
import { EvaluationOrchestrator } from '../../domain/evaluators/EvaluationOrchestrator';
import { LLD_PROBLEMS } from '../../data/problems';
import type { RawSubmission } from '../../domain/types';

describe('LLD Evaluation Engine', () => {
  const problem = LLD_PROBLEMS[0]; // Parking Lot

  it('should run AST deterministic evaluator and detect interface abstractions', async () => {
    const evaluator = new ASTDeterministicEvaluator();

    const goodSubmission: RawSubmission = {
      formatId: 'code_outline',
      content: `
        export interface IPricingStrategy { calculateFee(): number; }
        export interface ISpotAllocationStrategy { findSpot(): ParkingSpot; }
        export class ParkingSpot { spotId: string; }
        export class Vehicle { plate: string; }
        export class ParkingTicket { ticketId: string; }
        export class PaymentService { processPayment(): boolean; }
        export class EntranceGate { processEntry(): ParkingTicket; }
        export class ExitGate { processExit(): void; }
      `,
    };

    const parsed = {
      classes: [
        { name: 'IPricingStrategy', type: 'interface' as const, methods: [], fields: [] },
        { name: 'ISpotAllocationStrategy', type: 'interface' as const, methods: [], fields: [] },
        { name: 'ParkingSpot', type: 'class' as const, methods: [], fields: [] },
        { name: 'Vehicle', type: 'class' as const, methods: [], fields: [] },
        { name: 'ParkingTicket', type: 'class' as const, methods: [], fields: [] },
        { name: 'PaymentService', type: 'class' as const, methods: [], fields: [] },
        { name: 'EntranceGate', type: 'class' as const, methods: [], fields: [] },
        { name: 'ExitGate', type: 'class' as const, methods: [], fields: [] },
      ],
      relationships: [],
    };

    const result = await evaluator.evaluate({
      problem,
      rawSubmission: goodSubmission,
      parsedSubmission: parsed,
    });

    expect(result.score).toBeGreaterThan(60);
    expect(result.feedback.some((f) => f.title.includes('Polymorphic Abstractions'))).toBe(true);
  });

  it('should penalize designs missing interfaces or accumulating god class methods', async () => {
    const evaluator = new ASTDeterministicEvaluator();

    const badSubmission: RawSubmission = {
      formatId: 'code_outline',
      content: `export class MonolithParkingLot {}`,
    };

    const parsed = {
      classes: [
        {
          name: 'MonolithParkingLot',
          type: 'class' as const,
          methods: [
            { name: 'm1', params: [], returnType: 'void' },
            { name: 'm2', params: [], returnType: 'void' },
            { name: 'm3', params: [], returnType: 'void' },
            { name: 'm4', params: [], returnType: 'void' },
            { name: 'm5', params: [], returnType: 'void' },
            { name: 'm6', params: [], returnType: 'void' },
            { name: 'm7', params: [], returnType: 'void' },
            { name: 'm8', params: [], returnType: 'void' },
          ],
          fields: [],
        },
      ],
      relationships: [],
    };

    const result = await evaluator.evaluate({
      problem,
      rawSubmission: badSubmission,
      parsedSubmission: parsed,
    });

    expect(result.score).toBeLessThan(70);
    expect(result.feedback.some((f) => f.severity === 'critical')).toBe(true);
  });

  it('should orchestrate hybrid evaluation and calculate verdict and radar scores', async () => {
    const orchestrator = new EvaluationOrchestrator();

    const submission: RawSubmission = {
      formatId: 'code_outline',
      content: problem.sampleSolution?.content || '',
    };

    const result = await orchestrator.runEvaluation(problem, submission);

    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(['strong', 'solid', 'needs_work']).toContain(result.verdict);
    expect(result.radarScores.abstraction).toBeGreaterThan(0);
    expect(result.radarScores.solid).toBeGreaterThan(0);
    expect(result.feedback.length).toBeGreaterThan(0);
  });
});
