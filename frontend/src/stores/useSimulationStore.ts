import { create } from 'zustand';
import { toast } from 'sonner';
import { NODE_TYPE } from '@/modules/network/Node';
import { createRoutingPolicy } from '@/modules/routing/createRoutingPolicy';
import { ROUTING_POLICY, type RoutingPolicyId } from '@/modules/routing/routing.constants';
import { Simulation } from '@/modules/simulation/Simulation';
import { DEFAULT_RUN_UNTIL } from '@/modules/simulation/simulation.constants';
import { summarizeTrace } from '@/modules/simulation/summarizeTrace';
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
    simulationConfig: {
      ...simulationConfig,
      ...config,
    },
  })),

  runSimulation: () => {
    const { networkLayout } = useNetworkStore.getState();

    if (!networkLayout) {
      return;
    }

    const { network } = networkLayout;
    const { routingPolicyId, runUntil } = get().simulationConfig;
    const workstations = network.getNodes({ type: NODE_TYPE.WORKSTATION });
    const source = workstations.at(0);
    const destination = workstations.at(-1);

    if (!source || !destination) {
      return;
    }

    const simulation = new Simulation({
      network,
      routingPolicy: createRoutingPolicy(routingPolicyId),
      traffic: [{
        message: {
          id: 1,
          size: PLACEHOLDER_MESSAGE_LENGTH,
        },
        sourceId: source.id,
        destinationId: destination.id,
        time: 0,
      }],
    });

    try {
      simulation.run(runUntil);
    } catch (error) {
      console.error(error);

      // INFO: the trace ends with the event whose handler failed
      useTraceStore.getState().setEvents(simulation.trace);

      toast.error(`Simulation failed at t = ${simulation.time.toFixed(2)}`, {
        description: error instanceof Error ? error.message : String(error),
      });

      return;
    }

    useTraceStore.getState().setEvents(simulation.trace);

    const { eventCount, deliveredCount, droppedCount } = summarizeTrace(simulation.trace);
    const description = `${eventCount} events · ${deliveredCount} delivered · ${droppedCount} dropped`;
    const time = simulation.time.toFixed(2);

    if (simulation.pendingEventCount > 0) {
      toast.info(`Stopped at t = ${time}`, {
        description: `${description} · ${simulation.pendingEventCount} events still pending`,
      });
    } else {
      toast.success(`Simulation finished at t = ${time}`, { description });
    }
  },
}));
