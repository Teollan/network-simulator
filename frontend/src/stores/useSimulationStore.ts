import { create } from 'zustand';
import { toast } from 'sonner';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';
import { createRoutingPolicy } from '@/modules/routing/createRoutingPolicy';
import { ROUTING_POLICY } from '@/modules/routing/routing.constants';
import { Simulation } from '@/modules/simulation/Simulation';
import type { SimulationConfig } from '@/modules/simulation/simulationConfig.schema';
import {
  DEFAULT_MAX_HOPS,
  DEFAULT_MAX_PACKET_SIZE,
  DEFAULT_RUN_UNTIL,
} from '@/modules/simulation/simulation.constants';
import { getRandomSeed } from '@/modules/random/getRandomSeed';
import { summarizeTrace } from '@/modules/simulation/summarizeTrace';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { useTraceStore } from '@/stores/useTraceStore';

// TODO: replace with configurable traffic
const PLACEHOLDER_MESSAGE_LENGTH = 30;

interface SimulationStore {
  simulationConfig: SimulationConfig;

  setSimulationConfig: (config: Partial<SimulationConfig>) => void;
  runSimulation: () => void;
}

export const useSimulationStore = create<SimulationStore>()((set, get) => ({
  simulationConfig: {
    routingPolicyId: ROUTING_POLICY.HOT_POTATO,
    runUntil: DEFAULT_RUN_UNTIL,
    maxPacketSize: DEFAULT_MAX_PACKET_SIZE,
    maxHops: DEFAULT_MAX_HOPS,
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
    const {
      seed = getRandomSeed(),
      routingPolicyId,
      runUntil,
      maxPacketSize,
      maxHops,
    } = get().simulationConfig;
    const workstations = network.getNodes({ type: NODE_TYPE.WORKSTATION });
    const source = workstations.at(0);
    const destination = workstations.at(-1);

    if (!source || !destination) {
      return;
    }

    const simulation = new Simulation({
      seed,
      network,
      routingPolicy: createRoutingPolicy(routingPolicyId),
      packets: {
        maxSize: maxPacketSize,
        maxHops,
      },
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
        description: `seed ${seed} · ${error instanceof Error ? error.message : String(error)}`,
      });

      return;
    }

    useTraceStore.getState().setEvents(simulation.trace);

    const {
      eventCount,
      deliveredCount,
      droppedCount,
    } = summarizeTrace(simulation.trace);
    const description = `seed ${seed} · ${eventCount} events · ${deliveredCount} delivered · ${droppedCount} dropped`;
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
