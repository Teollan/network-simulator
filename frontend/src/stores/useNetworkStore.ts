import { create } from 'zustand';
import type { Network } from '@/modules/network/Network';
import { DEFAULT_TOPOLOGY_SPEC } from '@/modules/network/network.constants';
import {
  layoutNetwork,
  type LayoutPositions,
} from '@/modules/layout/layoutNetwork';
import { useTraceStore } from '@/stores/useTraceStore';
import { useTrafficStore } from '@/stores/useTrafficStore';
import { TopologyBuilder } from '@/modules/network/builder/TopologyBuilder';
import type { TopologySpec } from '@/modules/network/builder/TopologySpec';
import { getRandomSeed } from '@/modules/random/getRandomSeed';

interface NetworkLayout {
  network: Network;
  positions: LayoutPositions;
  seed: number;
}

interface NetworkStore {
  spec: TopologySpec;
  networkLayout: NetworkLayout | null;
  isGenerating: boolean;

  setSpec: (spec: Partial<TopologySpec>) => void;
  generateNetwork: () => Promise<void>;
}

export const useNetworkStore = create<NetworkStore>()((set, get) => ({
  spec: DEFAULT_TOPOLOGY_SPEC,
  networkLayout: null,
  isGenerating: false,

  setSpec: (spec) => set((state) => ({
    spec: {
      ...state.spec,
      ...spec,
    },
  })),

  generateNetwork: async () => {
    const {
      isGenerating,
      spec,
    } = get();

    if (isGenerating) {
      return;
    }

    set({ isGenerating: true });

    try {
      const seed = spec.seed ?? getRandomSeed();
      const network = new TopologyBuilder(seed).build(spec);
      const positions = await layoutNetwork(network);

      set({
        networkLayout: {
          network,
          positions,
          seed,
        },
        isGenerating: false,
      });

      useTraceStore.getState().clearEvents();
      useTrafficStore.getState().pruneGenerators(network);
    } catch (error) {
      console.error('Network generation failed', error);

      set({ isGenerating: false });
    }
  },
}));

void useNetworkStore.getState().generateNetwork();
