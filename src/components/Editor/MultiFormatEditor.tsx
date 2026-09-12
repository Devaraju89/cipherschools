import React, { useState, useMemo, useRef } from 'react';
import type { RawSubmission, SubmissionFormatId } from '../../domain/types';
import { ALL_SUBMISSION_FORMATS, getFormatParser } from '../../domain/formats';
import { MermaidViewer } from './MermaidViewer';
import {
  Code,
  FileJson,
  GitGraph,
  FileText,
  Send,
  Wand2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface MultiFormatEditorProps {
  submission: RawSubmission;
  onChange: (sub: RawSubmission) => void;
  onSubmit: () => void;
  isEvaluating: boolean;
  problemId: string;
}

const TEMPLATES: Record<SubmissionFormatId, Record<string, string>> = {
  code_outline: {
    parking_lot: `// Parking Lot System - Core Domain Classes
export enum VehicleType { MOTORBIKE, CAR, TRUCK }
export enum SpotType { SMALL, MEDIUM, LARGE }

export interface IPricingStrategy {
  calculateFee(ticket: ParkingTicket, exitTime: Date): number;
}

export class HourlyPricingStrategy implements IPricingStrategy {
  calculateFee(ticket: ParkingTicket, exitTime: Date): number {
    const hours = Math.ceil((exitTime.getTime() - ticket.entryTime.getTime()) / 3600000);
    return hours * 10;
  }
}

export interface ISpotAllocationStrategy {
  findSpot(spots: ParkingSpot[], vehicle: Vehicle): ParkingSpot | null;
}

export abstract class Vehicle {
  constructor(public licensePlate: string, public type: VehicleType) {}
}
export class Car extends Vehicle {
  constructor(plate: string) { super(plate, VehicleType.CAR); }
}

export class ParkingSpot {
  private isOccupied: boolean = false;
  constructor(public spotId: string, public type: SpotType, public floor: number) {}
  public assignVehicle(vehicle: Vehicle): boolean {
    if (this.isOccupied) return false;
    this.isOccupied = true;
    return true;
  }
  public vacate(): void { this.isOccupied = false; }
}

export class ParkingTicket {
  public ticketId: string;
  public entryTime: Date;
  constructor(public vehicle: Vehicle, public spot: ParkingSpot) {
    this.ticketId = "TKT_" + Date.now();
    this.entryTime = new Date();
  }
}

export class PaymentService {
  public processPayment(amount: number, method: string): boolean { return true; }
}
export class EntranceGate {
  constructor(private pricingStrategy: IPricingStrategy, private allocationStrategy: ISpotAllocationStrategy) {}
  public processEntry(vehicle: Vehicle, spots: ParkingSpot[]): ParkingTicket | null {
    const spot = this.allocationStrategy.findSpot(spots, vehicle);
    if (!spot) return null;
    spot.assignVehicle(vehicle);
    return new ParkingTicket(vehicle, spot);
  }
}
export class ExitGate {
  constructor(private pricingStrategy: IPricingStrategy, private paymentService: PaymentService) {}
  public processExit(ticket: ParkingTicket): void {
    const fee = this.pricingStrategy.calculateFee(ticket, new Date());
    this.paymentService.processPayment(fee, "CREDIT_CARD");
  }
}
`,
    rate_limiter: `// Rate Limiter System - Core Domain Abstractions
export interface IRateLimitAlgorithm {
  isAllowed(key: string): RateLimitDecision;
}

export interface IRateLimitStorage {
  get(key: string): number;
  set(key: string, value: number, ttl: number): void;
  increment(key: string): number;
}

export interface IClientKeyExtractor {
  extract(request: Request): string;
}

export class RateLimitDecision {
  constructor(
    public isAllowed: boolean,
    public remainingTokens: number,
    public retryAfterSeconds: number
  ) {}
}

export class TokenBucket implements IRateLimitAlgorithm {
  constructor(private storage: IRateLimitStorage, private capacity: number, private refillRate: number) {}
  public isAllowed(key: string): RateLimitDecision {
    const tokens = this.storage.get(key);
    if (tokens > 0) {
      this.storage.set(key, tokens - 1, 60);
      return new RateLimitDecision(true, tokens - 1, 0);
    }
    return new RateLimitDecision(false, 0, 60 / this.refillRate);
  }
}

export class SlidingWindowLog implements IRateLimitAlgorithm {
  constructor(private storage: IRateLimitStorage, private windowMs: number, private maxRequests: number) {}
  public isAllowed(key: string): RateLimitDecision {
    const count = this.storage.increment(key);
    const allowed = count <= this.maxRequests;
    return new RateLimitDecision(allowed, this.maxRequests - count, allowed ? 0 : this.windowMs / 1000);
  }
}

export class InMemoryStorage implements IRateLimitStorage {
  private store = new Map<string, number>();
  get(key: string): number { return this.store.get(key) || 0; }
  set(key: string, value: number, ttl: number): void { this.store.set(key, value); }
  increment(key: string): number {
    const val = (this.store.get(key) || 0) + 1;
    this.store.set(key, val);
    return val;
  }
}

export class StorageRepository implements IRateLimitStorage {
  constructor(private primary: IRateLimitStorage, private fallback: IRateLimitStorage) {}
  get(key: string): number {
    try { return this.primary.get(key); } catch { return this.fallback.get(key); }
  }
  set(key: string, value: number, ttl: number): void {
    try { this.primary.set(key, value, ttl); } catch { this.fallback.set(key, value, ttl); }
  }
  increment(key: string): number {
    try { return this.primary.increment(key); } catch { return this.fallback.increment(key); }
  }
}

export class RateLimiter {
  constructor(private algorithm: IRateLimitAlgorithm, private keyExtractor: IClientKeyExtractor) {}
  public evaluate(request: Request): RateLimitDecision {
    const key = this.keyExtractor.extract(request);
    return this.algorithm.isAllowed(key);
  }
}
`,
    splitwise_expenses: `// Splitwise Expense Sharing - Core Domain Classes
export interface ISplitStrategy {
  split(totalAmount: number, users: User[]): Map<User, number>;
  validate(): boolean;
}

export class User {
  constructor(public userId: string, public name: string, public email: string) {}
}

export class EqualSplit implements ISplitStrategy {
  constructor(private users: User[]) {}
  split(totalAmount: number): Map<User, number> {
    const perUser = totalAmount / this.users.length;
    const result = new Map<User, number>();
    this.users.forEach(u => result.set(u, Math.round(perUser * 100) / 100));
    return result;
  }
  validate(): boolean { return this.users.length > 0; }
}

export class PercentageSplit implements ISplitStrategy {
  constructor(private percentages: Map<User, number>) {}
  split(totalAmount: number): Map<User, number> {
    const result = new Map<User, number>();
    this.percentages.forEach((pct, user) => result.set(user, (totalAmount * pct) / 100));
    return result;
  }
  validate(): boolean {
    const total = Array.from(this.percentages.values()).reduce((s, v) => s + v, 0);
    return Math.abs(total - 100) < 0.01;
  }
}

export class ExactSplit implements ISplitStrategy {
  constructor(private amounts: Map<User, number>, private total: number) {}
  split(): Map<User, number> { return this.amounts; }
  validate(): boolean {
    const sum = Array.from(this.amounts.values()).reduce((s, v) => s + v, 0);
    return Math.abs(sum - this.total) < 0.01;
  }
}

export class Expense {
  constructor(
    public expenseId: string,
    public title: string,
    public totalAmount: number,
    public paidBy: User,
    private splitStrategy: ISplitStrategy
  ) {}
  public getSplits(): Map<User, number> { return this.splitStrategy.split(this.totalAmount, []); }
}

export class BalanceSheet {
  private balances = new Map<string, Map<string, number>>();
  public updateBalance(from: User, to: User, amount: number): void {
    if (!this.balances.has(from.userId)) this.balances.set(from.userId, new Map());
    const userBalances = this.balances.get(from.userId)!;
    userBalances.set(to.userId, (userBalances.get(to.userId) || 0) + amount);
  }
  public getNetBalance(userId: string): Map<string, number> {
    return this.balances.get(userId) || new Map();
  }
}

export class DebtSimplifier {
  public simplify(balanceSheet: BalanceSheet, users: User[]): { from: User, to: User, amount: number }[] {
    // Graph-based debt minimization algorithm
    return [];
  }
}
`,
    elevator_system: `// Elevator System - State Machine & Dispatcher
export enum ElevatorState { IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN, MAINTENANCE }
export enum Direction { UP, DOWN, NONE }

export interface IDispatchStrategy {
  selectElevator(elevators: ElevatorCar[], request: ElevatorRequest): ElevatorCar | null;
}

export class ElevatorRequest {
  constructor(public floor: number, public direction: Direction, public timestamp: Date = new Date()) {}
}

export class ElevatorCar {
  public state: ElevatorState = ElevatorState.IDLE;
  public currentFloor: number = 0;
  public direction: Direction = Direction.NONE;
  private requestQueue: ElevatorRequest[] = [];

  constructor(public carId: string, public capacity: number) {}

  public addRequest(request: ElevatorRequest): void { this.requestQueue.push(request); }
  public move(): void {
    if (this.requestQueue.length === 0) { this.state = ElevatorState.IDLE; return; }
    const next = this.requestQueue[0];
    this.direction = next.floor > this.currentFloor ? Direction.UP : Direction.DOWN;
    this.state = this.direction === Direction.UP ? ElevatorState.MOVING_UP : ElevatorState.MOVING_DOWN;
    this.currentFloor = next.floor;
    this.requestQueue.shift();
  }
  public openDoor(): void { this.state = ElevatorState.DOOR_OPEN; }
  public closeDoor(): void { this.state = ElevatorState.IDLE; }
}

export class LookDispatchStrategy implements IDispatchStrategy {
  selectElevator(elevators: ElevatorCar[], request: ElevatorRequest): ElevatorCar | null {
    return elevators
      .filter(e => e.state !== ElevatorState.MAINTENANCE)
      .sort((a, b) => Math.abs(a.currentFloor - request.floor) - Math.abs(b.currentFloor - request.floor))[0] || null;
  }
}

export class ElevatorController {
  constructor(private elevators: ElevatorCar[], private dispatchStrategy: IDispatchStrategy) {}
  public handleRequest(request: ElevatorRequest): void {
    const elevator = this.dispatchStrategy.selectElevator(this.elevators, request);
    if (elevator) elevator.addRequest(request);
  }
  public setDispatchStrategy(strategy: IDispatchStrategy): void { this.dispatchStrategy = strategy; }
}
`,
    default: `// Define your LLD classes, interfaces, and strategy abstractions here
export interface IStrategy {
  execute(): void;
}

export class ConcreteStrategy implements IStrategy {
  execute(): void {}
}

export abstract class BaseEntity {
  constructor(public id: string) {}
}
`,
  },
  mermaid_diagram: {
    parking_lot: `classDiagram
  class Vehicle {
    <<abstract>>
    +string licensePlate
    +VehicleType type
  }
  class Car {
    +Car(plate)
  }
  class IPricingStrategy {
    <<interface>>
    +calculateFee(ticket, exitTime) float
  }
  class HourlyPricingStrategy {
    +calculateFee(ticket, exitTime) float
  }
  class ISpotAllocationStrategy {
    <<interface>>
    +findSpot(spots, vehicle) ParkingSpot
  }
  class ParkingSpot {
    +string spotId
    +SpotType type
    +int floor
    -bool isOccupied
    +assignVehicle(vehicle) bool
    +vacate() void
  }
  class ParkingTicket {
    +string ticketId
    +Date entryTime
    +Vehicle vehicle
    +ParkingSpot spot
  }
  class EntranceGate {
    +processEntry(vehicle, spots) ParkingTicket
  }
  class ExitGate {
    +processExit(ticket) void
  }

  Vehicle <|-- Car
  HourlyPricingStrategy ..|> IPricingStrategy
  EntranceGate --> IPricingStrategy
  EntranceGate --> ISpotAllocationStrategy
  EntranceGate --> ParkingTicket
  ExitGate --> IPricingStrategy
  ParkingTicket o-- Vehicle
  ParkingTicket o-- ParkingSpot
`,
    rate_limiter: `classDiagram
  class IRateLimitAlgorithm {
    <<interface>>
    +isAllowed(key) RateLimitDecision
  }
  class TokenBucket {
    +isAllowed(key) RateLimitDecision
  }
  class IRateLimitStorage {
    <<interface>>
    +get(key) int
    +set(key, value, ttl) void
  }
  class RateLimiter {
    +evaluate(request) RateLimitDecision
  }

  TokenBucket ..|> IRateLimitAlgorithm
  RateLimiter --> IRateLimitAlgorithm
  RateLimiter --> IRateLimitStorage
`,
    splitwise_expenses: `classDiagram
  class User {
    +string userId
    +string name
  }
  class ISplitStrategy {
    <<interface>>
    +split(amount, users) Map
    +validate() bool
  }
  class EqualSplit {
    +split(amount, users) Map
  }
  class Expense {
    +string expenseId
    +float totalAmount
    +User paidBy
  }

  EqualSplit ..|> ISplitStrategy
  Expense --> ISplitStrategy
  Expense --> User
`,
    elevator_system: `classDiagram
  class ElevatorCar {
    +ElevatorState state
    +int currentFloor
    +move() void
  }
  class IDispatchStrategy {
    <<interface>>
    +selectElevator(elevators, request) ElevatorCar
  }
  class LookDispatchStrategy {
    +selectElevator(elevators, request) ElevatorCar
  }
  class ElevatorController {
    +handleRequest(request) void
  }

  LookDispatchStrategy ..|> IDispatchStrategy
  ElevatorController --> IDispatchStrategy
  ElevatorController o-- ElevatorCar
`,
    default: `classDiagram
  class MyEntity {
    +string id
    +string name
    +doSomething() void
  }
  class IStrategy {
    <<interface>>
    +execute() void
  }
  class ConcreteStrategy {
    +execute() void
  }
  ConcreteStrategy ..|> IStrategy
  MyEntity --> IStrategy
`,
  },
  json_design: {
    default: `{
  "classes": [
    {
      "name": "Entity",
      "type": "class",
      "fields": [{"name": "id", "type": "string"}],
      "methods": [{"name": "doSomething", "params": [], "returnType": "void"}]
    },
    {
      "name": "IStrategy",
      "type": "interface",
      "methods": [{"name": "execute", "params": [], "returnType": "void"}]
    }
  ],
  "relationships": [
    {"from": "ConcreteStrategy", "to": "IStrategy", "type": "realization"}
  ],
  "notes": "Add your design rationale and tradeoff reasoning here."
}`,
  },
  text: {
    default: `## Low-Level Design: [Problem Title]

### Core Domain Classes & Responsibilities

1. **[EntityName]**: Manages [responsibility]. Owns [state].
2. **[IStrategyName] (Interface)**: Decouples [behavior] from [caller].
3. **[ConcreteImpl]**: Implements [IStrategyName] using [algorithm].

### Design Patterns Applied
- **Strategy Pattern**: Used for [pricing/dispatch/split] to allow runtime swapping.
- **Observer Pattern**: Used for [event notification].

### Trade-offs & Reasoning
- Chose [approach A] over [approach B] because [reason].
- Thread-safety: [mutex/lock/atomic] ensures [guarantee].

### Edge Cases Addressed
- [Edge case 1]: Handled by [mechanism].
- [Edge case 2]: Fallback to [behavior].
`,
  },
};

function getTemplate(formatId: SubmissionFormatId, problemId: string): string {
  const formatTemplates = TEMPLATES[formatId] as Record<string, string>;
  return formatTemplates[problemId] || formatTemplates['default'] || '';
}

export const MultiFormatEditor: React.FC<MultiFormatEditorProps> = ({
  submission,
  onChange,
  onSubmit,
  isEvaluating,
  problemId,
}) => {
  const [activeFormat, setActiveFormat] = useState<SubmissionFormatId>(submission.formatId);
  const [showDiagramPreview, setShowDiagramPreview] = useState<boolean>(true);

  const lineGutterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = useMemo(() => {
    return Math.max(1, submission.content.split('\n').length);
  }, [submission.content]);

  // Real-time AST pre-flight validation
  const astValidation = useMemo(() => {
    if (!submission.content.trim()) {
      return { isValid: true, message: 'Ready for input', count: 0 };
    }
    try {
      const parser = getFormatParser(activeFormat);
      const parsed = parser.parse(submission);
      if (parsed.classes.length > 0) {
        return {
          isValid: true,
          message: `AST Syntax Valid (${parsed.classes.length} entities)`,
          count: parsed.classes.length,
        };
      }
      return {
        isValid: true,
        message: 'AST Syntax Valid',
        count: 0,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Syntax error';
      return {
        isValid: false,
        message: `Syntax Notice: ${msg}`,
        count: 0,
      };
    }
  }, [submission, activeFormat]);

  const handleFormatTabChange = (fmtId: SubmissionFormatId) => {
    setActiveFormat(fmtId);
    onChange({ ...submission, formatId: fmtId });
  };

  const handleLoadTemplate = () => {
    const template = getTemplate(activeFormat, problemId);
    onChange({ formatId: activeFormat, content: template });
  };

  const handleFormatContent = () => {
    if (activeFormat === 'json_design') {
      try {
        const parsed = JSON.parse(submission.content);
        onChange({ ...submission, content: JSON.stringify(parsed, null, 2) });
      } catch {
        // ignore
      }
    } else {
      const cleaned = submission.content
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n');
      onChange({ ...submission, content: cleaned });
    }
  };

  const handleEditorScroll = () => {
    if (textareaRef.current && lineGutterRef.current) {
      lineGutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/70 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Top Editor Bar: Format Switcher Tabs & Helpers */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-2.5 bg-slate-900/50 flex-shrink-0">
        {/* Format Selector Pills */}
        <div className="flex space-x-1 rounded-lg bg-slate-950 p-1 border border-slate-800/80 overflow-x-auto">
          {ALL_SUBMISSION_FORMATS.map((fmt) => {
            const isSelected = activeFormat === fmt.id;
            return (
              <button
                key={fmt.id}
                onClick={() => handleFormatTabChange(fmt.id)}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
                title={fmt.description}
              >
                {fmt.id === 'code_outline' && <Code className="h-3.5 w-3.5" />}
                {fmt.id === 'mermaid_diagram' && <GitGraph className="h-3.5 w-3.5" />}
                {fmt.id === 'json_design' && <FileJson className="h-3.5 w-3.5" />}
                {fmt.id === 'text' && <FileText className="h-3.5 w-3.5" />}
                <span>
                  {fmt.id === 'code_outline'
                    ? '</> Code / Class Outline'
                    : fmt.id === 'mermaid_diagram'
                    ? 'Mermaid Diagram'
                    : fmt.id === 'json_design'
                    ? 'JSON Schema'
                    : 'Plain Text'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFormatContent}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/70 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex-shrink-0"
            title="Format and clean up code indentation"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Format</span>
          </button>
          <button
            onClick={handleLoadTemplate}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700/80 bg-slate-800/70 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex-shrink-0"
            title="Load standard solution template for this problem"
          >
            <Wand2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Load Template</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-950">
        {activeFormat === 'mermaid_diagram' ? (
          /* Mermaid Split View: Code on top, Diagram Preview on bottom */
          <div className="flex flex-col h-full min-h-0">
            <div className="relative flex min-h-[160px] max-h-[220px] flex-shrink-0 border-b border-slate-800 bg-slate-950">
              <div
                ref={lineGutterRef}
                className="select-none py-3 px-2 text-right font-mono text-[11px] text-slate-600 bg-slate-950 border-r border-slate-800/80 w-10 overflow-hidden leading-relaxed flex-shrink-0"
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                onScroll={handleEditorScroll}
                value={submission.content}
                onChange={(e) => onChange({ ...submission, content: e.target.value })}
                placeholder="Enter Mermaid classDiagram syntax..."
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                className="flex-1 w-full px-3 py-3 font-mono text-xs text-slate-200 placeholder-slate-600 bg-slate-950 focus:outline-none leading-relaxed resize-none overflow-y-auto"
              />
            </div>

            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-900/30">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
                <span className="text-xs font-semibold text-indigo-400 flex items-center space-x-1.5">
                  <GitGraph className="h-3.5 w-3.5" />
                  <span>Interactive Class Diagram Preview</span>
                </span>
                <button
                  onClick={() => setShowDiagramPreview(!showDiagramPreview)}
                  className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  {showDiagramPreview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  <span>{showDiagramPreview ? 'Collapse Preview' : 'Expand Preview'}</span>
                </button>
              </div>
              {showDiagramPreview && (
                <div className="flex-1 overflow-auto p-2">
                  <MermaidViewer chart={submission.content} />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Code, JSON, Plain Text: Full-height editor with synchronized line numbers */
          <div className="flex flex-1 min-h-0 overflow-hidden bg-slate-950">
            <div
              ref={lineGutterRef}
              className="select-none py-3 px-2 text-right font-mono text-[11px] text-slate-600 bg-slate-950 border-r border-slate-800/80 w-11 overflow-hidden leading-relaxed flex-shrink-0"
            >
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              onScroll={handleEditorScroll}
              value={submission.content}
              onChange={(e) => onChange({ ...submission, content: e.target.value })}
              placeholder={`Enter your LLD design in ${activeFormat} format...`}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              className="flex-1 w-full px-4 py-3 font-mono text-xs text-slate-200 placeholder-slate-600 bg-slate-950 focus:outline-none leading-relaxed resize-none overflow-y-auto"
            />
          </div>
        )}
      </div>

      {/* Stitch-Style Sticky Pre-Flight Status & Submit Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-800 bg-slate-900/90 flex-shrink-0">
        {/* Pre-flight Telemetry Chips */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-mono text-slate-400 text-[11px]">
            Format: <strong className="text-slate-200 font-semibold">{activeFormat}</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-slate-400 text-[11px]">
            {submission.content.length.toLocaleString()} chars
          </span>
          <span className="text-slate-600">•</span>
          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
            {astValidation.isValid ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">{astValidation.message}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-400 font-semibold">{astValidation.message}</span>
              </>
            )}
          </div>
        </div>

        {/* Submit Button & Subtitle */}
        <div className="flex flex-col items-end">
          <button
            onClick={onSubmit}
            disabled={isEvaluating || !submission.content.trim()}
            className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isEvaluating ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Evaluating Design...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Submit & Evaluate Design</span>
              </>
            )}
          </button>
          <span className="text-[10px] text-slate-500 mt-1 font-mono hidden sm:inline">
            Evaluated by AST Checker + Hybrid AI Reasoner
          </span>
        </div>
      </div>
    </div>
  );
};
