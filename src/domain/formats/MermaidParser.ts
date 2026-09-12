import type { ISubmissionFormat } from '../evaluator';
import type { ParsedClass, ParsedRelationship, ParsedSubmission, RawSubmission } from '../types';

export class MermaidParser implements ISubmissionFormat {
  id = 'mermaid_diagram' as const;
  name = 'Mermaid Class Diagram';
  description = 'Visual object diagram rendered via Mermaid classDiagram syntax.';

  parse(raw: RawSubmission): ParsedSubmission {
    const text = raw.content || '';
    const classesMap = new Map<string, ParsedClass>();
    const relationships: ParsedRelationship[] = [];

    const lines = text.split('\n');
    let currentClass: ParsedClass | null = null;

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('%%') || line === 'classDiagram') continue;

      // Class definition: class ClassName { ... }
      const classStartMatch = line.match(/^class\s+([A-Za-z0-9_]+)\s*\{?/);
      if (classStartMatch) {
        const className = classStartMatch[1];
        if (!classesMap.has(className)) {
          classesMap.set(className, {
            name: className,
            type: 'class',
            methods: [],
            fields: [],
          });
        }
        currentClass = classesMap.get(className)!;
        if (!line.includes('{')) {
          currentClass = null; // single line class declaration
        }
        continue;
      }

      if (line === '}') {
        currentClass = null;
        continue;
      }

      // Class stereotyping <<interface>> or <<abstract>>
      const stereotypeMatch = line.match(/^<<\s*(interface|abstract)\s*>>/i);
      if (currentClass && stereotypeMatch) {
        const type = stereotypeMatch[1].toLowerCase();
        if (type === 'interface') currentClass.type = 'interface';
        if (type === 'abstract') currentClass.isAbstract = true;
        continue;
      }

      // Member line inside class block: +string spotId or +calculateFee(ticket) float
      if (currentClass) {
        const memberLine = line.replace(/^[+\-#~]/, '').trim();
        if (memberLine.includes('(')) {
          // Method
          const methodParts = memberLine.match(/([A-Za-z0-9_]+)\((.*?)\)\s*([A-Za-z0-9_]*)/);
          if (methodParts) {
            currentClass.methods.push({
              name: methodParts[1],
              params: methodParts[2] ? methodParts[2].split(',').map((s) => s.trim()) : [],
              returnType: methodParts[3] || 'void',
            });
          }
        } else if (memberLine) {
          // Field
          const fieldParts = memberLine.split(/\s+/);
          if (fieldParts.length >= 2) {
            currentClass.fields.push({
              type: fieldParts[0],
              name: fieldParts[1],
            });
          } else {
            currentClass.fields.push({
              type: 'unknown',
              name: memberLine,
            });
          }
        }
        continue;
      }

      // Relationship line: ClassA <|-- ClassB or ClassA o-- ClassB
      const relMatch = line.match(
        /([A-Za-z0-9_]+)\s*(<\|--|--\|>|o--|--o|--\*|\*--|-->|<--)\s*([A-Za-z0-9_]+)(?:\s*:\s*(.*))?/
      );
      if (relMatch) {
        const from = relMatch[1];
        const symbol = relMatch[2];
        const to = relMatch[3];
        let relType: ParsedRelationship['type'] = 'association';

        if (symbol === '<|--' || symbol === '--|>') relType = 'inheritance';
        else if (symbol === 'o--' || symbol === '--o') relType = 'aggregation';
        else if (symbol === '*--' || symbol === '--*') relType = 'composition';

        relationships.push({ from, to, type: relType });

        // Ensure both classes exist in map
        if (!classesMap.has(from)) {
          classesMap.set(from, { name: from, type: 'class', methods: [], fields: [] });
        }
        if (!classesMap.has(to)) {
          classesMap.set(to, { name: to, type: 'class', methods: [], fields: [] });
        }
      }
    }

    return {
      classes: Array.from(classesMap.values()),
      relationships,
      notes: text,
    };
  }
}
