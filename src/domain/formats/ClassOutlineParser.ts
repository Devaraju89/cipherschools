import type { ISubmissionFormat } from '../evaluator';
import type { ParsedClass, ParsedRelationship, ParsedSubmission, RawSubmission } from '../types';

export class ClassOutlineParser implements ISubmissionFormat {
  id = 'code_outline' as const;
  name = 'Code / Class Outline';
  description = 'Object-oriented code or class declarations in TypeScript/Java syntax.';

  parse(raw: RawSubmission): ParsedSubmission {
    const text = raw.content || '';
    const classes: ParsedClass[] = [];
    const relationships: ParsedRelationship[] = [];

    // Split text into block chunks
    const lines = text.split('\n');
    let currentClass: ParsedClass | null = null;

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('//') || line.startsWith('/*')) continue;

      // Class / Interface / Enum regex matcher
      const classMatch = line.match(
        /^(export\s+)?(abstract\s+)?(class|interface|enum)\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?(?:\s+implements\s+([A-Za-z0-9_,\s]+))?/
      );

      if (classMatch) {
        const isAbstract = !!classMatch[2];
        const entityType = classMatch[3] as 'class' | 'interface' | 'enum';
        const name = classMatch[4];
        const extendsName = classMatch[5];
        const implementsNames = classMatch[6]
          ? classMatch[6].split(',').map((s) => s.trim())
          : [];

        currentClass = {
          name,
          type: entityType,
          isAbstract,
          methods: [],
          fields: [],
          extends: extendsName,
          implements: implementsNames.length > 0 ? implementsNames : undefined,
        };

        classes.push(currentClass);

        if (extendsName) {
          relationships.push({
            from: name,
            to: extendsName,
            type: 'inheritance',
          });
        }

        for (const impl of implementsNames) {
          relationships.push({
            from: name,
            to: impl,
            type: 'realization',
          });
        }
        continue;
      }

      if (currentClass) {
        // Field matcher e.g., private spotId: string; or SpotType type;
        const fieldMatch = line.match(
          /^(private|public|protected)?\s*(readonly\s+)?([A-Za-z0-9_]+)\s*[:\s]\s*([A-Za-z0-9_<>,\[\]\s]+);?/
        );
        if (fieldMatch && !line.includes('(')) {
          const fieldName = fieldMatch[3];
          const fieldType = fieldMatch[4].trim();
          currentClass.fields.push({ name: fieldName, type: fieldType });

          // Detect association from field type (if field type is custom entity name)
          const cleanType = fieldType.replace(/\[\]|<.*>/g, '').trim();
          if (cleanType && /^[A-Z]/.test(cleanType) && cleanType !== currentClass.name) {
            relationships.push({
              from: currentClass.name,
              to: cleanType,
              type: fieldType.includes('[]') || fieldType.includes('List') ? 'aggregation' : 'association',
            });
          }
          continue;
        }

        // Method matcher e.g., public calculateFee(ticket: Ticket): number
        const methodMatch = line.match(
          /^(private|public|protected|abstract)?\s*(async\s+)?([A-Za-z0-9_]+)\s*\((.*?)\)\s*[:\s]?\s*([A-Za-z0-9_<>,\[\]\s]*)/
        );
        if (methodMatch && methodMatch[3] !== 'constructor' && methodMatch[3] !== 'if') {
          const methodName = methodMatch[3];
          const paramsRaw = methodMatch[4];
          const returnType = methodMatch[5] ? methodMatch[5].trim() : 'void';
          const params = paramsRaw
            ? paramsRaw.split(',').map((p) => p.trim())
            : [];

          currentClass.methods.push({
            name: methodName,
            params,
            returnType,
          });
        }
      }
    }

    return { classes, relationships, notes: text };
  }
}
