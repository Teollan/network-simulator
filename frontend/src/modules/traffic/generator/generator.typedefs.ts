import type { Transmission } from '@/modules/traffic/Transmission';

export interface TrafficConfig {
  generators: TrafficGeneratorConfig[];
}

export type TrafficGeneratorConfig = TrafficGeneratorConfigBase & (
  (SampledTrafficGeneratorConfig & {
    kind: 'periodic';
    period: number;
    phase: number;
  }) | (SampledTrafficGeneratorConfig & {
    kind: 'poisson';
    rate: number;
  }) | {
    kind: 'scripted';
    transmissions: Transmission[];
  }
);

interface TrafficGeneratorConfigBase {
  sourceId: number;
}

// periodic and poisson generators draw each transmission's destination and size
interface SampledTrafficGeneratorConfig {
  destination: DestinationConfig;
  size: SizeConfig;
}

export type DestinationConfig = {
  kind: 'constant';
  destinationId: number
} | {
  kind: 'uniform',
};

export type SizeConfig = {
  kind: 'constant';
  size: number
} | {
  kind: 'range',
  min: number,
  max: number,
};
