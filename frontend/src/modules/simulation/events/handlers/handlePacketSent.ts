import {
  PACKET_DROP_REASON,
  SIMULATION_EVENT_KIND,
  type SimulationEvent,
} from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';
import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';

const ROUTING_DELAY = 1;

export function handlePacketSent(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_SENT>,
  simulation: Simulation,
) {
  const { thisNode, from, packet } = event.data;

  const destinations: StatefulNode[] = simulation.routing.route(
    {
      thisNode,
      source: from,
      destination: packet.destination,
    },
    simulation,
  );

  if (destinations.length === 0) {
    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_DROPPED,
      data: {
        packet,
        thisNode,
        reason: PACKET_DROP_REASON.NO_ROUTE,
      },
      eta: 0,
    });

    return;
  }

  const frames = destinations.map((destination) => ({
    source: thisNode,
    destination,
    packet,
    isCorrupted: false,
  }));

  for (const frame of frames) {
    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.FRAME_FORWARDED,
      data: { frame },
      eta: ROUTING_DELAY,
    });
  }
}
