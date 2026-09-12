import type { ISubmissionFormat } from '../evaluator';
import type { ParsedSubmission, RawSubmission } from '../types';

export class JsonDesignParser implements ISubmissionFormat {
  id = 'json_design' as const;
  name = 'JSON Design Schema';
  description = 'Structured JSON object schema defining entities, properties, and relationships.';

  parse(raw: RawSubmission): ParsedSubmission {
    try {
      const data = JSON.parse(raw.content || '{}');
      const classes = Array.isArray(data.classes) ? data.classes : [];
      const relationships = Array.isArray(data.relationships) ? data.relationships : [];
      return {
        classes: classes.map((c: any) => ({
          name: String(c.name || 'Unnamed'),
          type: c.type === 'interface' ? 'interface' : c.type === 'enum' ? 'enum' : 'class',
          isAbstract: !!c.isAbstract,
          methods: Array.isArray(c.methods)
            ? c.methods.map((m: any) => ({
                name: String(typeof m === 'string' ? m : m.name || ''),
                params: Array.isArray(m.params) ? m.params : [],
                returnType: m.returnType || 'void',
              }))
            : [],
          fields: Array.isArray(c.fields)
            ? c.fields.map((f: any) => ({
                name: String(typeof f === 'string' ? f : f.name || ''),
                type: f.type || 'string',
              }))
            : [],
          extends: c.extends,
          implements: c.implements,
        })),
        relationships: relationships.map((r: any) => ({
          from: String(r.from || ''),
          to: String(r.to || ''),
          type: r.type || 'association',
          multiplicity: r.multiplicity,
        })),
        notes: data.notes || '',
      };
    } catch {
      return { classes: [], relationships: [], notes: raw.content };
    }
  }
}
