import { describe, it, expect } from 'vitest';
import { ClassOutlineParser } from '../../domain/formats/ClassOutlineParser';
import { MermaidParser } from '../../domain/formats/MermaidParser';
import { JsonDesignParser } from '../../domain/formats/JsonDesignParser';

describe('Submission Format Parsers', () => {
  it('should parse TypeScript/Java class outlines correctly', () => {
    const parser = new ClassOutlineParser();
    const rawContent = `
      export interface IPricingStrategy {
        calculateFee(ticket: Ticket): number;
      }

      export class ParkingSpot {
        private spotId: string;
        private isOccupied: boolean;
        public assignVehicle(vehicle: Vehicle): boolean;
      }
    `;

    const parsed = parser.parse({ formatId: 'code_outline', content: rawContent });

    expect(parsed.classes.length).toBe(2);
    expect(parsed.classes[0].name).toBe('IPricingStrategy');
    expect(parsed.classes[0].type).toBe('interface');
    expect(parsed.classes[1].name).toBe('ParkingSpot');
    expect(parsed.classes[1].methods.length).toBe(1);
    expect(parsed.classes[1].methods[0].name).toBe('assignVehicle');
  });

  it('should parse Mermaid classDiagram syntax correctly', () => {
    const parser = new MermaidParser();
    const mermaidText = `
      classDiagram
        class ParkingSpot {
          +string spotId
          +assignVehicle(v) bool
        }
        class Vehicle {
          <<abstract>>
        }
        Vehicle <|-- Car
    `;

    const parsed = parser.parse({ formatId: 'mermaid_diagram', content: mermaidText });

    expect(parsed.classes.length).toBeGreaterThanOrEqual(2);
    const spotClass = parsed.classes.find((c) => c.name === 'ParkingSpot');
    expect(spotClass).toBeDefined();
    expect(spotClass?.methods[0].name).toBe('assignVehicle');
    expect(parsed.relationships.some((r) => r.type === 'inheritance')).toBe(true);
  });

  it('should parse structured JSON design without crashing on invalid data', () => {
    const parser = new JsonDesignParser();
    const validJson = JSON.stringify({
      classes: [{ name: 'ElevatorController', type: 'class', methods: ['dispatchRequest'] }],
      relationships: [],
    });

    const parsed = parser.parse({ formatId: 'json_design', content: validJson });
    expect(parsed.classes.length).toBe(1);
    expect(parsed.classes[0].name).toBe('ElevatorController');

    // Test malformed JSON fallback
    const malformed = parser.parse({ formatId: 'json_design', content: '{ invalid json...' });
    expect(malformed.classes.length).toBe(0);
  });
});
