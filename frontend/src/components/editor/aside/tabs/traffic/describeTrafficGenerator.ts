import { TRAFFIC_GENERATOR_KIND_LABEL } from '@/components/editor/aside/tabs/traffic/trafficGeneratorForm';
import type {
  DestinationConfig,
  SizeConfig,
  TrafficGeneratorConfig,
} from '@/modules/traffic/generator/generator.typedefs';

export type NodeLabelFn = (id: number) => string;

export interface TrafficGeneratorDetail {
  term: string;
  description: string;
}

export const summarizeTrafficGenerator = (config: TrafficGeneratorConfig): string => {
  const kind = TRAFFIC_GENERATOR_KIND_LABEL[config.kind];

  switch (config.kind) {
    case 'periodic':
      return `${kind} · every ${config.period}`;
    case 'poisson':
      return `${kind} · λ = ${config.rate}`;
    case 'scripted':
      return `${kind} · ${config.transmissions.length} ${config.transmissions.length === 1 ? 'message' : 'messages'}`;
  }
};

const describeDestination = (destination: DestinationConfig, labelOf: NodeLabelFn): string => {
  switch (destination.kind) {
    case 'constant':
      return labelOf(destination.destinationId);
    case 'uniform':
      return 'Any other workstation';
  }
};

const describeSize = (size: SizeConfig): string => {
  switch (size.kind) {
    case 'constant':
      return `${size.size} B`;
    case 'range':
      return `${size.min}–${size.max} B, uniform`;
  }
};

export const describeTrafficGenerator = (
  config: TrafficGeneratorConfig,
  labelOf: NodeLabelFn,
): TrafficGeneratorDetail[] => {
  switch (config.kind) {
    case 'periodic':
      return [
        {
          term: 'Period',
          description: `${config.period}`,
        },
        {
          term: 'Phase',
          description: `${config.phase}`,
        },
        {
          term: 'Destination',
          description: describeDestination(config.destination, labelOf),
        },
        {
          term: 'Size',
          description: describeSize(config.size),
        },
      ];
    case 'poisson':
      return [
        {
          term: 'Rate',
          description: `${config.rate} per time unit (mean gap ${(1 / config.rate).toFixed(2)})`,
        },
        {
          term: 'Destination',
          description: describeDestination(config.destination, labelOf),
        },
        {
          term: 'Size',
          description: describeSize(config.size),
        },
      ];
    case 'scripted':
      return config.transmissions.map(({
        time,
        destinationId,
        size,
      }) => ({
        term: `t = ${time}`,
        description: `${size} B to ${labelOf(destinationId)}`,
      }));
  }
};
