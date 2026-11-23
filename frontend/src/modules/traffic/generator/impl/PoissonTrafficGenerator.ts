import type { TrafficGenerator } from '@/modules/traffic/generator/TrafficGenerator';
import type { Transmission } from '@/modules/traffic/Transmission';
import type { Generator } from '@/modules/util/generator';
import type { Random } from 'random';

export interface PoissonTrafficGeneratorConfig {
  sourceId: number;
  random: Random;
  lambda: number;
  destinationGeneratorFn: Generator<number>;
  sizeGeneratorFn: Generator<number>;
}

export class PoissonTrafficGenerator implements TrafficGenerator {
  readonly sourceId: number;

  private exponentialDistribution: () => number;
  private destinationGeneratorFn: Generator<number>;
  private sizeGeneratorFn: Generator<number>;

  private nextTime;

  constructor(config: PoissonTrafficGeneratorConfig) {
    this.sourceId = config.sourceId;
    this.exponentialDistribution = config.random.exponential(config.lambda);
    this.destinationGeneratorFn = config.destinationGeneratorFn;
    this.sizeGeneratorFn = config.sizeGeneratorFn;

    this.nextTime = this.exponentialDistribution();
  }

  public next(): Transmission | null {
    const time = this.nextTime;

    this.nextTime += this.exponentialDistribution();

    return {
      time,
      destinationId: this.destinationGeneratorFn(),
      size: this.sizeGeneratorFn(),
    };
  }
};
