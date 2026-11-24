import {
  PACKET_DROP_REASON,
  SIMULATION_EVENT_KIND,
  type SimulationEvent,
} from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

const FRAME_TO_PACKET_DELAY = 0;

export function handleFrameReceived(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.FRAME_RECEIVED>,
  simulation: Simulation,
) {
  const { frame } = event.data;

  simulation.schedule({
    kind: SIMULATION_EVENT_KIND.LINK_RELEASED,
    data: {
      source: frame.source,
      destination: frame.destination,
    },
    eta: 0,
  });

  if (frame.isCorrupted) {
    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_DROPPED,
      data: {
        packet: frame.packet,
        thisNode: frame.destination,
        reason: PACKET_DROP_REASON.CORRUPTED,
      },
      eta: 0,
    });

    return;
  }

  simulation.schedule({
    kind: SIMULATION_EVENT_KIND.PACKET_RECEIVED,
    data: {
      thisNode: frame.destination,
      from: frame.source,
      packet: frame.packet,
    },
    eta: FRAME_TO_PACKET_DELAY,
  });
}
