import { create } from 'zustand';
import type { Network } from '@/modules/network/Network';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';
import type { TrafficGeneratorConfig } from '@/modules/traffic/generator/generator.typedefs';
import { Serial } from '@/modules/util/Serial';

export interface TrafficGeneratorEntry {
  // UI identity only; the simulation keys generators by their position in the list
  id: number;
  config: TrafficGeneratorConfig;
}

interface TrafficStore {
  generators: TrafficGeneratorEntry[];

  addGenerator: (config: TrafficGeneratorConfig) => void;
  updateGenerator: (id: number, config: TrafficGeneratorConfig) => void;
  removeGenerator: (id: number) => void;
  pruneGenerators: (network: Network) => void;
}

const entriesSerial = new Serial();

const referencedNodeIds = (config: TrafficGeneratorConfig): number[] => {
  switch (config.kind) {
    case 'scripted':
      return [config.sourceId, ...config.transmissions.map(({ destinationId }) => destinationId)];
    default:
      return config.destination.kind === 'constant'
        ? [config.sourceId, config.destination.destinationId]
        : [config.sourceId];
  }
};

export const useTrafficStore = create<TrafficStore>()((set) => ({
  generators: [],

  addGenerator: (config) => set(({ generators }) => ({
    generators: [
      ...generators,
      {
        id: entriesSerial.next(),
        config,
      },
    ],
  })),

  updateGenerator: (id, config) => set(({ generators }) => ({
    generators: generators.map((entry) => (
      entry.id === id
        ? {
          id,
          config,
        }
        : entry
    )),
  })),

  removeGenerator: (id) => set(({ generators }) => ({
    generators: generators.filter((entry) => entry.id !== id),
  })),

  pruneGenerators: (network) => set(({ generators }) => {
    const workstationIds = new Set(network.getNodes({ type: NODE_TYPE.WORKSTATION }).map(({ id }) => id));

    return {
      generators: generators.filter(({ config }) => (
        referencedNodeIds(config).every((id) => workstationIds.has(id))
      )),
    };
  }),
}));
