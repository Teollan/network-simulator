import type { TrafficGenerator } from '@/modules/traffic/generator/TrafficGenerator';
import type { Transmission } from '@/modules/traffic/Transmission';

export interface ScriptedTrafficGeneratorConfig {
  sourceId: number;
  transmissions: Transmission[];
}

export class ScriptedTrafficGenerator implements TrafficGenerator {
  readonly sourceId: number;

  private transmissions: Transmission[];

  constructor(config: ScriptedTrafficGeneratorConfig) {
    this.sourceId = config.sourceId;
    this.transmissions = [...config.transmissions];
  }

  public next(): Transmission | null {
    const next = this.transmissions.shift();

    if (!next) {
      return null;
    }

    return next;
  }
};
