import { Simulation } from '@/modules/simulation/Simulation';
import type {
  DestinationConfig,
  SizeConfig,
  TrafficGeneratorConfig,
} from '@/modules/traffic/generator/generator.typedefs';
import { PeriodicTrafficGenerator } from '@/modules/traffic/generator/impl/PeriodicTrafficGenerator';
import { PoissonTrafficGenerator } from '@/modules/traffic/generator/impl/PoissonTrafficGenerator';
import { ScriptedTrafficGenerator } from '@/modules/traffic/generator/impl/ScriptedTrafficGenerator';
import type { TrafficGenerator } from '@/modules/traffic/generator/TrafficGenerator';
import { pick } from '@/modules/util/functional';
import {
  makeConstantGenerator,
  makeIntegerGenerator,
  makePoolGenerator,
  type Generator,
} from '@/modules/util/generator';
import { Random } from 'random';

export function makeTrafficGenerator(
  simulation: Simulation,
) {
  return (config: TrafficGeneratorConfig, idx: number): TrafficGenerator => {
    switch (config.kind) {
      case 'periodic':
        return new PeriodicTrafficGenerator({
          sourceId: config.sourceId,
          period: config.period,
          phase: config.phase,
          sizeGeneratorFn: makeSizeGenerator(config.size, idx, simulation),
          destinationGeneratorFn: makeDestinationGenerator(config.destination, config.sourceId, idx, simulation),
        });
      case 'poisson':
        return new PoissonTrafficGenerator({
          sourceId: config.sourceId,
          lambda: config.rate,
          random: new Random(`${simulation.seed}/traffic/generator::${idx}`),
          sizeGeneratorFn: makeSizeGenerator(config.size, idx, simulation),
          destinationGeneratorFn: makeDestinationGenerator(config.destination, config.sourceId, idx, simulation),
        });
      case 'scripted':
        return new ScriptedTrafficGenerator({
          sourceId: config.sourceId,
          transmissions: config.transmissions,
        });
    }
  };

}

const makeSizeGenerator = (config: SizeConfig, idx: number, simulation: Simulation): Generator<number> => {
  switch (config.kind) {
    case 'constant':
      return makeConstantGenerator(config.size);
    case 'range':
      return makeIntegerGenerator(
        config.min,
        config.max,
        new Random(`${simulation.seed}/traffic/generator::${idx}/size`),
      );
  }
};

const makeDestinationGenerator = (
  config: DestinationConfig,
  sourceId: number,
  idx: number,
  simulation: Simulation,
): Generator<number> => {
  switch (config.kind) {
    case 'constant':
      return makeConstantGenerator(simulation.network.getNode(config.destinationId).id);
    case 'uniform':
      return makePoolGenerator(
        simulation.network.getWorkstations()
          .map(pick('id'))
          .filter((id) => id !== sourceId),
        new Random(`${simulation.seed}/traffic/generator::${idx}/destination`),
      );
  }
};
