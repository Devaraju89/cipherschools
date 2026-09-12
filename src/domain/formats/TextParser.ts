import type { ISubmissionFormat } from '../evaluator';
import type { ParsedClass, ParsedSubmission, RawSubmission } from '../types';

export class TextParser implements ISubmissionFormat {
  id = 'text' as const;
  name = 'Plain Text / Conceptual Narrative';
  description = 'Unstructured text explanation of classes, responsibilities, and tradeoffs.';

  parse(raw: RawSubmission): ParsedSubmission {
    const text = raw.content || '';
    const classes: ParsedClass[] = [];

    // Extract potential class names mentioned in text like "Class: ParkingSpot" or "1. ParkingSpot"
    const lines = text.split('\n');
    for (const line of lines) {
      const match = line.match(/(?:Class|Interface|Component|1\.|2\.|3\.|4\.|5\.|-)\s*`?([A-Z][A-Za-z0-9_]+)`?/);
      if (match) {
        const name = match[1];
        if (!classes.some((c) => c.name === name)) {
          classes.push({
            name,
            type: line.toLowerCase().includes('interface') ? 'interface' : 'class',
            methods: [],
            fields: [],
          });
        }
      }
    }

    return { classes, relationships: [], notes: text };
  }
}
