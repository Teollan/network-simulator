import type { Transmission } from '@/modules/traffic/Transmission';

export interface TrafficGenerator {
  readonly sourceId: number;

  next(): Transmission | null;
}
