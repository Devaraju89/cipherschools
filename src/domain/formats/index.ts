import type { ISubmissionFormat } from '../evaluator';
import type { SubmissionFormatId } from '../types';
import { ClassOutlineParser } from './ClassOutlineParser';
import { MermaidParser } from './MermaidParser';
import { JsonDesignParser } from './JsonDesignParser';
import { TextParser } from './TextParser';

export const ALL_SUBMISSION_FORMATS: ISubmissionFormat[] = [
  new ClassOutlineParser(),
  new MermaidParser(),
  new JsonDesignParser(),
  new TextParser(),
];

export function getFormatParser(formatId: SubmissionFormatId): ISubmissionFormat {
  const parser = ALL_SUBMISSION_FORMATS.find((f) => f.id === formatId);
  return parser || new TextParser();
}
