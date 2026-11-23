import type { TrafficGenerator } from '@/modules/traffic/generator/TrafficGenerator';
import type { Transmission } from '@/modules/traffic/Transmission';
import type { Generator } from '@/modules/util/generator';

export interface PeriodicTrafficGeneratorConfig {
  sourceId: number;
  period: number;
  phase?: number;
  destinationGeneratorFn: Generator<number>;
  sizeGeneratorFn: Generator<number>;
}

export class PeriodicTrafficGenerator implements TrafficGenerator {
  readonly sourceId: number;

  private period: number;
  private phase: number;
  private destinationGeneratorFn: Generator<number>;
  private sizeGeneratorFn: Generator<number>;

  private nextTime;

  constructor(config: PeriodicTrafficGeneratorConfig) {
    this.sourceId = config.sourceId;
    this.period = config.period;
    this.phase = config.phase ?? 0;
    this.destinationGeneratorFn = config.destinationGeneratorFn;
    this.sizeGeneratorFn = config.sizeGeneratorFn;

    this.nextTime = this.phase;
  }

  public next(): Transmission | null {
    const time = this.nextTime;

    this.nextTime += this.period;

    return {
      time,
      destinationId: this.destinationGeneratorFn(),
      size: this.sizeGeneratorFn(),
    };
  }
};
