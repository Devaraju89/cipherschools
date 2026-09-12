import type { Problem } from '../domain/types';

export const LLD_PROBLEMS: Problem[] = [
  {
    id: 'parking_lot',
    title: 'Parking Lot Management System',
    category: 'System & Resource Management',
    difficulty: 'Medium',
    shortDescription: 'Design an automated multi-level parking lot with dynamic pricing, spot allocation strategies, ticket management, and entry/exit gates.',
    prompt: `
### Problem Statement
Design a Low-Level Object-Oriented system for an automated multi-floor Parking Lot.

### Core Requirements
1. **Spot Types & Capacity**: The parking lot has multiple floors, each with dedicated spots for different vehicle types: Motorbikes (Small), Cars (Medium), and Trucks/Buses (Large).
2. **Vehicle Parking & Spot Allocation**: When a vehicle arrives at an Entry Gate, the system must assign an optimal available spot using a pluggable allocation strategy (e.g. Nearest Spot, First Available).
3. **Ticket Issuance & Gate Entry**: Issue a \`ParkingTicket\` containing ticket ID, vehicle info, assigned spot ID, entry gate ID, and timestamp.
4. **Checkout & Dynamic Fee Calculation**: Upon exit, calculate the fee based on duration and vehicle type using a flexible, dynamic pricing policy (e.g., Flat Rate, Hourly Rate, Peak Hours Surcharge).
5. **Payment Processing**: Support multiple payment methods (Credit Card, Cash, UPI). Upon successful payment, mark spot as vacant and exit gate opened.

### Extensibility & Stress Requirements
- How easy is it to introduce electric vehicle (EV) charging spots with kilowatt-hour billing?
- How does the system handle concurrent spot allocation at multiple entry gates without double booking?
`,
    expectedConcepts: [
      'ParkingSpot',
      'Vehicle',
      'ParkingTicket',
      'PricingStrategy',
      'AllocationStrategy',
      'PaymentService',
      'EntranceGate',
      'ExitGate',
    ],
    constraints: [
      { type: 'functional', text: 'Must support Motorbike, Car, and Truck vehicle types.' },
      { type: 'functional', text: 'Pricing policy must be configurable and hot-swappable at runtime.' },
      { type: 'non_functional', text: 'Thread-safe spot allocation to prevent double-booking during peak traffic.' },
      { type: 'edge_case', text: 'Handle lost tickets or invalid ticket scans gracefully.' },
    ],
    rubric: [
      {
        id: 'pl_rubric_1',
        title: 'Core Domain Modeling & Abstraction',
        description: 'Clean separation of entities (ParkingSpot, Vehicle, Ticket, Gate) with explicit encapsulation and state management.',
        weight: 35,
        category: 'architecture',
      },
      {
        id: 'pl_rubric_2',
        title: 'SOLID Principles & Strategy Pattern',
        description: 'Decoupling of SpotAllocationStrategy and PricingStrategy via interfaces adhering to Open/Closed Principle.',
        weight: 25,
        category: 'solid',
      },
      {
        id: 'pl_rubric_3',
        title: 'Concurrency & Edge Case Resilience',
        description: 'Handling race conditions on spot assignment and handling lost tickets or full lot states.',
        weight: 20,
        category: 'edge_cases',
      },
      {
        id: 'pl_rubric_4',
        title: 'Trade-off Articulation & Extensibility',
        description: 'Clear reasoning behind in-memory vs DB locking and ease of adding EV charging spots.',
        weight: 20,
        category: 'tradeoffs',
      },
    ],
    sampleSolution: {
      formatId: 'code_outline',
      content: `// Sample Parking Lot Solution
export enum VehicleType { MOTORBIKE, CAR, TRUCK }
export enum SpotType { SMALL, MEDIUM, LARGE }

export abstract class Vehicle {
  constructor(public licensePlate: string, public type: VehicleType) {}
}
export class Car extends Vehicle {
  constructor(plate: string) { super(plate, VehicleType.CAR); }
}

export class ParkingSpot {
  private isOccupied: boolean = false;
  private currentVehicle?: Vehicle;
  constructor(public spotId: string, public type: SpotType, public floorNumber: number) {}
  
  public assignVehicle(vehicle: Vehicle): boolean {
    if (this.isOccupied) return false;
    this.currentVehicle = vehicle;
    this.isOccupied = true;
    return true;
  }
  public vacate(): void {
    this.currentVehicle = undefined;
    this.isOccupied = false;
  }
}

export interface IPricingStrategy {
  calculateFee(ticket: ParkingTicket, exitTime: Date): number;
}
export class HourlyPricingStrategy implements IPricingStrategy {
  calculateFee(ticket: ParkingTicket, exitTime: Date): number {
    const hours = Math.ceil((exitTime.getTime() - ticket.entryTime.getTime()) / (1000 * 60 * 60));
    return hours * 10;
  }
}

export interface ISpotAllocationStrategy {
  findSpot(spots: ParkingSpot[], vehicle: Vehicle): ParkingSpot | null;
}
export class NearestSpotStrategy implements ISpotAllocationStrategy {
  findSpot(spots: ParkingSpot[], vehicle: Vehicle): ParkingSpot | null {
    return spots.find(s => !s.isOccupied) || null;
  }
}

export class ParkingTicket {
  public ticketId: string;
  public entryTime: Date;
  constructor(public vehicle: Vehicle, public spot: ParkingSpot) {
    this.ticketId = "TKT_" + Math.random().toString(36).substring(2, 9);
    this.entryTime = new Date();
  }
}
`,
    },
  },
  {
    id: 'rate_limiter',
    title: 'Distributed Rate Limiter',
    category: 'System & Distributed Resilience',
    difficulty: 'Hard',
    shortDescription: 'Design an extensible rate limiting engine supporting Token Bucket, Sliding Window Log, and Leaky Bucket algorithms.',
    prompt: `
### Problem Statement
Design an in-application API Rate Limiter to restrict request throughput per client key (IP, User ID, API Token).

### Requirements
1. **Algorithm Support**: Provide clean abstractions to switch between Token Bucket, Sliding Window Counter, and Fixed Window algorithms.
2. **Client Key Extraction**: Support flexible key extraction (IP address, Header Token, Tenant ID).
3. **Storage Abstraction**: Decouple rate limit counters from storage engine (In-Memory ConcurrentHashMap, Redis, Memcached).
4. **Decision Envelope**: Return a decision object containing \`isAllowed: boolean\`, \`retryAfterSeconds: number\`, and \`remainingTokens: number\`.
`,
    expectedConcepts: [
      'RateLimiter',
      'RateLimitAlgorithm',
      'TokenBucket',
      'SlidingWindowLog',
      'StorageRepository',
      'ClientKeyExtractor',
      'RateLimitDecision',
    ],
    constraints: [
      { type: 'functional', text: 'Algorithm must be pluggable per endpoint or user tier.' },
      { type: 'non_functional', text: 'Sub-millisecond execution latency per rate limit evaluation.' },
      { type: 'edge_case', text: 'Graceful fallback if cache storage (Redis) is down.' },
    ],
    rubric: [
      {
        id: 'rl_rubric_1',
        title: 'Strategy & Storage Abstraction',
        description: 'Clean interfaces for RateLimitAlgorithm and RateLimitStorage.',
        weight: 35,
        category: 'solid',
      },
      {
        id: 'rl_rubric_2',
        title: 'Thread Safety & Atomicity',
        description: 'Correct handling of race conditions under high concurrent traffic.',
        weight: 30,
        category: 'edge_cases',
      },
      {
        id: 'rl_rubric_3',
        title: 'Extensibility & Fault Tolerance',
        description: 'Resilience against storage backend failures (fail-open vs fail-closed trade-offs).',
        weight: 35,
        category: 'tradeoffs',
      },
    ],
  },
  {
    id: 'splitwise_expenses',
    title: 'Splitwise Expense Sharing System',
    category: 'Finance & Domain Logic',
    difficulty: 'Medium',
    shortDescription: 'Design an expense tracking system to divide bills across friends using Equal, Exact, and Percentage split rules with balance simplification.',
    prompt: `
### Problem Statement
Design a low-level expense tracking system similar to Splitwise.

### Requirements
1. **User & Group Management**: Users can create group expenses or 1-on-1 expenses.
2. **Expense Types & Split Strategies**: Support multiple split rules:
   - Equal Split (divided evenly)
   - Exact Amount Split (specific dollar amounts per user)
   - Percentage Split (must sum to 100%)
3. **Balance Computation**: Track net balances owed between users.
4. **Balance Simplification**: Minimize total debt transactions across a group of users using graph minimization algorithms.
`,
    expectedConcepts: [
      'User',
      'Expense',
      'SplitStrategy',
      'EqualSplit',
      'ExactSplit',
      'PercentageSplit',
      'BalanceSheet',
      'DebtSimplifier',
    ],
    constraints: [
      { type: 'functional', text: 'Percentage split validation must guarantee sum = 100%.' },
      { type: 'functional', text: 'Pluggable SplitStrategy pattern for easy addition of new split rules.' },
      { type: 'edge_case', text: 'Rounding errors in penny division must be safely assigned.' },
    ],
    rubric: [
      {
        id: 'sp_rubric_1',
        title: 'Domain Model & Strategy Pattern',
        description: 'Decoupling Expense creation from SplitStrategy implementation.',
        weight: 40,
        category: 'solid',
      },
      {
        id: 'sp_rubric_2',
        title: 'Financial Precision & Rounding Safety',
        description: 'Handling split validation and currency rounding edge cases.',
        weight: 30,
        category: 'edge_cases',
      },
      {
        id: 'sp_rubric_3',
        title: 'Balance Simplification Algorithm Architecture',
        description: 'Clear isolation of debt simplification logic from data storage entities.',
        weight: 30,
        category: 'architecture',
      },
    ],
  },
  {
    id: 'elevator_system',
    title: 'Multi-Elevator Dispatch Controller',
    category: 'State Machine & Real-Time Control',
    difficulty: 'Medium',
    shortDescription: 'Design a controller managing N elevators across M floors with LOOK/SCAN dispatch strategies and door state machines.',
    prompt: `
### Problem Statement
Design an Elevator System for a multi-story building with multiple elevator cars.

### Requirements
1. **Elevator Car State Machine**: States: IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN, MAINTENANCE.
2. **Internal & External Requests**: Handle hall calls (Up/Down button on floor) and car calls (Floor button inside elevator).
3. **Elevator Dispatcher Strategy**: Dispatch hall requests to optimal elevator car based on distance, direction, and capacity using LOOK/SCAN strategy.
4. **Emergency & Safety Policies**: Override dispatcher during fire alarms or power outages.
`,
    expectedConcepts: [
      'ElevatorCar',
      'ElevatorController',
      'DispatchStrategy',
      'ElevatorRequest',
      'DoorState',
      'Direction',
    ],
    constraints: [
      { type: 'functional', text: 'Support pluggable elevator dispatch algorithms.' },
      { type: 'non_functional', text: 'Efficient request queue processing without elevator starvation.' },
      { type: 'edge_case', text: 'Handling passenger weight limit exceedance.' },
    ],
    rubric: [
      {
        id: 'el_rubric_1',
        title: 'State Machine & Encapsulation',
        description: 'Clean encapsulation of ElevatorCar state transitions.',
        weight: 35,
        category: 'architecture',
      },
      {
        id: 'el_rubric_2',
        title: 'Dispatch Strategy Pattern',
        description: 'Polymorphic DispatchStrategy for scheduling requests.',
        weight: 35,
        category: 'solid',
      },
      {
        id: 'el_rubric_3',
        title: 'Concurrency & Starvation Avoidance',
        description: 'Managing concurrent floor requests and preventing elevator starvation.',
        weight: 30,
        category: 'edge_cases',
      },
    ],
  },
];
