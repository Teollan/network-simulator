import { create } from 'zustand';
import type { Network } from '@/modules/network/Network';
import { DEFAULT_NETWORK_RECIPE } from '@/modules/network/network.constants';
import { layoutNetwork, type LayoutPositions } from '@/modules/layout/layoutNetwork';
import { useTraceStore } from '@/stores/useTraceStore';
import { makeNetwork } from '@/modules/network/builder/makeNetwork';
import type { NetworkRecipe } from '@/modules/network/builder/NetworkRecipe';

interface NetworkLayout {
  network: Network;
  positions: LayoutPositions;
}

interface NetworkStore {
  networkRecipe: NetworkRecipe;
  networkLayout: NetworkLayout | null;
  isGenerating: boolean;

  generateNetwork: () => Promise<void>;
}

export const useNetworkStore = create<NetworkStore>()((set, get) => ({
  networkRecipe: DEFAULT_NETWORK_RECIPE,
  networkLayout: null,
  isGenerating: false,

  generateNetwork: async () => {
    const {
      isGenerating,
      networkRecipe,
    } = get();

    if (isGenerating) {
      return;
    }

    set({ isGenerating: true });

    try {
      const network = makeNetwork(networkRecipe);
      const positions = await layoutNetwork(network);

      set({
        networkLayout: {
          network,
          positions,
        },
        isGenerating: false,
      });

      useTraceStore.getState().clearEvents();
    } catch (error) {
      console.error('Network generation failed', error);

      set({ isGenerating: false });
    }
  },
}));

void useNetworkStore.getState().generateNetwork();
