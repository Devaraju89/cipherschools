import type { StressTestScenario } from '../domain/types';

export const STRESS_TEST_SCENARIOS: Record<string, StressTestScenario[]> = {
  parking_lot: [
    {
      id: 'st_ev_spots',
      title: '⚡ Requirement Evolution: EV Charging Spots',
      description: 'The business expands to support Electric Vehicles. EV spots require per-kWh electricity billing alongside hourly parking fees.',
      impactRequirement: 'How easily can your PricingStrategy and ParkingSpot class accommodate EV billing without modifying existing Car/Motorbike code?',
      evaluationPrompt: 'Check if PricingStrategy and ParkingSpot support composition or extension for EV charging.',
    },
    {
      id: 'st_concurrency_gate',
      title: '🚨 Extreme Concurrency: Gate Rush Hour',
      description: '50 vehicles arrive simultaneously at 4 entrance gates during morning peak hour.',
      impactRequirement: 'Will your spot allocation logic suffer from race conditions or double booking without synchronized/atomic spot claiming?',
      evaluationPrompt: 'Evaluate thread safety and synchronization primitives in spot allocation.',
    },
  ],
  rate_limiter: [
    {
      id: 'st_redis_crash',
      title: '🔥 Infrastructure Failure: Redis Cache Outage',
      description: 'The distributed Redis cache storing rate limit counters experiences a network partition or crash.',
      impactRequirement: 'Does your RateLimiter gracefully fallback to local in-memory counters (fail-open or fail-closed) without crashing API calls?',
      evaluationPrompt: 'Check storage repository abstraction and fallback exception handling.',
    },
  ],
  splitwise_expenses: [
    {
      id: 'st_crypto_currency',
      title: '💱 Multi-Currency & FX Exchange',
      description: 'Expenses are paid in different currencies (USD, EUR, INR) within the same group.',
      impactRequirement: 'Does your Expense entity isolate currency conversion from debt simplification algorithms?',
      evaluationPrompt: 'Evaluate CurrencyConverter interface abstraction.',
    },
  ],
  elevator_system: [
    {
      id: 'st_fire_alarm',
      title: '🚨 Emergency Override: Building Fire Alarm',
      description: 'A building-wide fire alarm is triggered.',
      impactRequirement: 'Does ElevatorController support an emergency strategy pattern that moves all cars to ground floor and locks doors open?',
      evaluationPrompt: 'Evaluate emergency state override in elevator dispatcher.',
    },
  ],
};
