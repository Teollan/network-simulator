import { create } from 'zustand';
import type { Network } from '@/modules/network/Network';
import { generateNetwork, type NetworkConfig } from '@/modules/network/generateNetwork';
import { DEFAULT_NETWORK_CONFIG } from '@/modules/network/network.constants';
import { layoutNetwork, type LayoutPositions } from '@/modules/layout/layoutNetwork';

interface NetworkLayout {
  network: Network;
  positions: LayoutPositions;
}

interface NetworkState {
  networkConfig: NetworkConfig;
  networkLayout: NetworkLayout | null;
  isGenerating: boolean;

  setNetworkConfig: (config: Partial<NetworkConfig>) => void;
  generateNetwork: () => Promise<void>;
}

export const useNetworkStore = create<NetworkState>()((set, get) => ({
  networkConfig: DEFAULT_NETWORK_CONFIG,
  networkLayout: null,
  isGenerating: false,

  setNetworkConfig: (config) => set(({ networkConfig }) => ({
    networkConfig: { ...networkConfig, ...config },
  })),

  generateNetwork: async () => {
    if (get().isGenerating) {
      return;
    }

    set({ isGenerating: true });

    try {
      const network = generateNetwork(get().networkConfig);
      const positions = await layoutNetwork(network);

      set({ networkLayout: { network, positions }, isGenerating: false });
    } catch (error) {
      console.error('Network generation failed', error);

      set({ isGenerating: false });
    }
  },
}));

void useNetworkStore.getState().generateNetwork();
