import { ResourceId } from './resources';
import { state } from './state';
import { emit } from './events';

export interface ProducerDef {
  id:       string;
  resource: ResourceId;
  rate:     () => number;  // units per second (float; accumulator handles fractional amounts)
}

const registry: ProducerDef[] = [];

// Fractional carry-over per resource so sub-1/sec rates still produce over time
const accumulators: Partial<Record<ResourceId, number>> = {};

export function registerProducer(def: ProducerDef): void {
  registry.push(def);
}

// Sum of all producer rates for a given resource — used for display
export function totalRate(resource: ResourceId): number {
  return registry.reduce((sum, p) => p.resource === resource ? sum + p.rate() : sum, 0);
}

export function tick(dt: number): void {
  let produced = false;
  for (const producer of registry) {
    const rate = producer.rate();
    if (rate <= 0) continue;
    const acc   = (accumulators[producer.resource] ?? 0) + rate * dt;
    const whole = Math.floor(acc);
    accumulators[producer.resource] = acc - whole;
    if (whole > 0) {
      state.resources[producer.resource] += BigInt(whole);
      produced = true;
    }
  }
  if (produced) emit('resources:produced');
}
