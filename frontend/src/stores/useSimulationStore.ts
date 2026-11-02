import { create } from 'zustand';
import { createRoutingPolicy } from '@/modules/routing/createRoutingPolicy';
import { ROUTING_POLICY, type RoutingPolicyId } from '@/modules/routing/routing.constants';
import { Simulation } from '@/modules/simulation/Simulation';
import { SIMULATION_EVENT_KIND } from '@/modules/simulation/SimulationEvent';
import { DEFAULT_RUN_UNTIL } from '@/modules/simulation/simulation.constants';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { useTraceStore } from '@/stores/useTraceStore';

// TODO: replace with configurable traffic
const PLACEHOLDER_MESSAGE_LENGTH = 30;

export interface SimulationConfig {
  routingPolicyId: RoutingPolicyId;
  runUntil: number;
}

interface SimulationStore {
  simulationConfig: SimulationConfig;

  setSimulationConfig: (config: Partial<SimulationConfig>) => void;
  runSimulation: () => void;
}

export const useSimulationStore = create<SimulationStore>()((set, get) => ({
  simulationConfig: {
    routingPolicyId: ROUTING_POLICY.HOT_POTATO,
    runUntil: DEFAULT_RUN_UNTIL,
  },

  setSimulationConfig: (config) => set(({ simulationConfig }) => ({
    simulationConfig: { ...simulationConfig, ...config },
  })),

  runSimulation: () => {
    const { networkLayout } = useNetworkStore.getState();

    if (!networkLayout) {
      return;
    }

    const { network } = networkLayout;
    const { routingPolicyId, runUntil } = get().simulationConfig;
    const source = network.nodes.at(0);
    const destination = network.nodes.at(-1);

    if (!source || !destination) {
      return;
    }

    const simulation = new Simulation(network, createRoutingPolicy(routingPolicyId));

    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.MESSAGE_SENT,
      data: {
        fromNodeId: source.id,
        toNodeId: destination.id,
        message: { id: 1, length: PLACEHOLDER_MESSAGE_LENGTH },
      },
      time: 0,
    });

    simulation.run(runUntil);

    useTraceStore.getState().setEvents(simulation.trace);
  },
}));
