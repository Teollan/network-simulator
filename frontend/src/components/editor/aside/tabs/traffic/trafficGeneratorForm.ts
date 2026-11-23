import type {
  TrafficGeneratorConfig,
  TrafficGeneratorKind,
} from '@/modules/traffic/generator/generator.typedefs';
import type { Transmission } from '@/modules/traffic/Transmission';

export interface TrafficGeneratorFormValues {
  kind: TrafficGeneratorKind;
  sourceId: number;

  period: number;
  phase: number;
  rate: number;

  destination: {
    kind: 'constant' | 'uniform';
    destinationId: number;
  };
  size: {
    kind: 'constant' | 'range';
    size: number;
    min: number;
    max: number;
  };

  transmissions: Transmission[];
}

export const TRAFFIC_GENERATOR_KIND_LABEL: Record<TrafficGeneratorKind, string> = {
  periodic: 'Periodic',
  poisson: 'Poisson',
  scripted: 'Scripted',
};

export const DEFAULT_MESSAGE_SIZE = 30;

export const makeDefaultFormValues = (sourceId: number): TrafficGeneratorFormValues => ({
  kind: 'poisson',
  sourceId,

  period: 10,
  phase: 0,
  rate: 0.1,

  destination: {
    kind: 'uniform',
    destinationId: Number.NaN,
  },
  size: {
    kind: 'constant',
    size: DEFAULT_MESSAGE_SIZE,
    min: 1,
    max: DEFAULT_MESSAGE_SIZE,
  },

  transmissions: [],
});

export const toFormValues = (config: TrafficGeneratorConfig): TrafficGeneratorFormValues => {
  const defaults = makeDefaultFormValues(config.sourceId);

  if (config.kind === 'scripted') {
    return {
      ...defaults,
      ...config,
    };
  }

  return {
    ...defaults,
    ...config,
    destination: {
      ...defaults.destination,
      ...config.destination,
    },
    size: {
      ...defaults.size,
      ...config.size,
    },
  };
};
