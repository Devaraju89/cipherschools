import type { EvaluationInput, EvaluatorOutput, IEvaluator } from '../evaluator';
import type { FeedbackItem } from '../types';

export class ASTDeterministicEvaluator implements IEvaluator {
  id = 'ast_deterministic_evaluator';
  name = 'Deterministic AST & Schema Analyzer';
  type = 'deterministic' as const;

  async evaluate(input: EvaluationInput): Promise<EvaluatorOutput> {
    const { problem, parsedSubmission, rawSubmission } = input;
    const feedback: FeedbackItem[] = [];
    let scoreAcc = 100;

    const classNames = parsedSubmission.classes.map((c) => c.name.toLowerCase());
    const rawText = (rawSubmission.content || '').toLowerCase();

    // 1. Check required domain concepts
    for (const concept of problem.expectedConcepts) {
      const conceptLower = concept.toLowerCase();
      const isFoundInClasses = classNames.some((name) => name.includes(conceptLower));
      const isFoundInText = rawText.includes(conceptLower);

      if (isFoundInClasses) {
        feedback.push({
          id: `det_concept_${concept}`,
          source: 'deterministic',
          criterionId: problem.rubric[0]?.id || 'arch_concepts',
          severity: 'pass',
          title: `Required Concept Identified: ${concept}`,
          message: `Your design explicitly defines class/interface abstraction for '${concept}'.`,
          evidence: [`Class: ${parsedSubmission.classes.find((c) => c.name.toLowerCase().includes(conceptLower))?.name}`],
        });
      } else if (isFoundInText) {
        feedback.push({
          id: `det_concept_${concept}_text`,
          source: 'deterministic',
          criterionId: problem.rubric[0]?.id || 'arch_concepts',
          severity: 'info',
          title: `Concept Mentioned in Notes: ${concept}`,
          message: `'${concept}' was mentioned in text notes, but is missing a formal class/interface representation.`,
          evidence: [`Text mentions '${concept}'`],
          suggestion: `Promote '${concept}' into a first-class domain entity or strategy interface.`,
        });
        scoreAcc -= 8;
      } else {
        feedback.push({
          id: `det_concept_${concept}_missing`,
          source: 'deterministic',
          criterionId: problem.rubric[0]?.id || 'arch_concepts',
          severity: 'warning',
          title: `Missing Domain Concept: ${concept}`,
          message: `Expected key domain concept '${concept}' was not found in your design artifact.`,
          evidence: [`No entity matching '${concept}'`],
          suggestion: `Add a class or interface for '${concept}' to handle its domain behavior explicitly.`,
        });
        scoreAcc -= 15;
      }
    }

    // 2. Check SOLID Design Principles Heuristics (Interfaces & Strategy Pattern)
    const interfaces = parsedSubmission.classes.filter((c) => c.type === 'interface' || c.isAbstract);

    if (interfaces.length === 0) {
      feedback.push({
        id: `det_solid_no_interface`,
        source: 'deterministic',
        criterionId: problem.rubric.find((r) => r.category === 'solid')?.id || 'solid_interfaces',
        severity: 'critical',
        title: 'Tight Coupling / Missing Abstractions',
        message: 'No interfaces or abstract classes were declared. Concrete classes are directly coupled.',
        evidence: ['0 interfaces or abstract classes declared'],
        suggestion: 'Introduce interfaces (e.g., PricingStrategy, DispatchStrategy) to adhere to Open/Closed Principle.',
      });
      scoreAcc -= 20;
    } else {
      feedback.push({
        id: `det_solid_interfaces_pass`,
        source: 'deterministic',
        criterionId: problem.rubric.find((r) => r.category === 'solid')?.id || 'solid_interfaces',
        severity: 'pass',
        title: 'Polymorphic Abstractions Present',
        message: `Found ${interfaces.length} interface/abstract class definition(s): ${interfaces.map((i) => i.name).join(', ')}.`,
        evidence: interfaces.map((i) => `Interface/Abstract: ${i.name}`),
      });
    }

    // 3. Check for God Class anti-pattern (>7 methods or >7 fields)
    for (const c of parsedSubmission.classes) {
      if (c.methods.length > 7 || c.fields.length > 7) {
        feedback.push({
          id: `det_god_class_${c.name}`,
          source: 'deterministic',
          criterionId: problem.rubric.find((r) => r.category === 'solid')?.id || 'solid_srp',
          severity: 'warning',
          title: `Potential Single Responsibility Violation: ${c.name}`,
          message: `Class '${c.name}' has ${c.methods.length} methods and ${c.fields.length} fields. It may be accumulating too many responsibilities.`,
          evidence: [`Class ${c.name}: ${c.methods.length} methods, ${c.fields.length} fields`],
          suggestion: `Extract helper services or strategy objects out of ${c.name}.`,
        });
        scoreAcc -= 10;
      }
    }

    // 4. Check edge cases & constraints coverage
    const edgeCaseConstraints = problem.constraints.filter((c) => c.type === 'edge_case');
    for (const ec of edgeCaseConstraints) {
      const keywords = ec.text.toLowerCase().split(' ').filter((w) => w.length > 4);
      const isCovered = keywords.some((kw) => rawText.includes(kw));

      if (!isCovered) {
        feedback.push({
          id: `det_edge_case_${ec.text.substring(0, 10)}`,
          source: 'deterministic',
          criterionId: problem.rubric.find((r) => r.category === 'edge_cases')?.id || 'edge_cases',
          severity: 'info',
          title: `Unaddressed Edge Case Constraint`,
          message: `Constraint check: "${ec.text}" may not be explicitly handled.`,
          evidence: [`Requirement: ${ec.text}`],
          suggestion: `Add validation method or status handling for this edge case.`,
        });
        scoreAcc -= 5;
      }
    }

    const finalScore = Math.max(10, Math.min(100, scoreAcc));

    return {
      score: finalScore,
      feedback,
      metadata: {
        totalClasses: parsedSubmission.classes.length,
        totalRelationships: parsedSubmission.relationships.length,
        interfaceCount: interfaces.length,
      },
    };
  }
}
