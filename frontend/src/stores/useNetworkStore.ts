import { create } from 'zustand';
import { toast } from 'sonner';
import type { Network } from '@/modules/network/Network';
import { DEFAULT_TOPOLOGY_SPEC } from '@/modules/network/network.constants';
import {
  layoutNetwork,
  type LayoutPositions,
} from '@/modules/layout/layoutNetwork';
import { useTraceStore } from '@/stores/useTraceStore';
import { useTrafficStore } from '@/stores/useTrafficStore';
import { TopologyBuilder } from '@/modules/network/builder/TopologyBuilder';
import type {
  TopologyBuilderAction,
  TopologySpec,
} from '@/modules/network/builder/TopologySpec';
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
  addAction: (action: TopologyBuilderAction) => void;
  updateAction: (idx: number, action: TopologyBuilderAction) => void;
  removeAction: (idx: number) => void;
  moveAction: (idx: number, offset: number) => void;
  resetActions: () => void;
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

  addAction: (action) => set(({ spec }) => ({
    spec: {
      ...spec,
      actions: [...spec.actions, action],
    },
  })),

  updateAction: (idx, action) => set(({ spec }) => ({
    spec: {
      ...spec,
      actions: spec.actions.with(idx, action),
    },
  })),

  removeAction: (idx) => set(({ spec }) => ({
    spec: {
      ...spec,
      actions: spec.actions.toSpliced(idx, 1),
    },
  })),

  moveAction: (idx, offset) => set(({ spec }) => {
    const target = idx + offset;

    if (target < 0 || target >= spec.actions.length) {
      return {};
    }

    const actions = [...spec.actions];

    [actions[idx], actions[target]] = [actions[target], actions[idx]];

    return {
      spec: {
        ...spec,
        actions,
      },
    };
  }),

  resetActions: () => set(({ spec }) => ({
    spec: {
      ...spec,
      actions: DEFAULT_TOPOLOGY_SPEC.actions,
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

      toast.error('Topology generation failed', {
        description: error instanceof Error ? error.message : String(error),
      });

      set({ isGenerating: false });
    }
  },
}));

void useNetworkStore.getState().generateNetwork();
