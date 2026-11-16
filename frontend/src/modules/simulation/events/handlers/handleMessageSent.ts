import { SIMULATION_EVENT_KIND, type SimulationEvent } from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

const PACKET_SPLIT_DELAY = 0;

export function handleMessageSent(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.MESSAGE_SENT>,
  simulation: Simulation,
) {
  const {
    source,
    destination,
    message,
  } = event.data;

  const packets = simulation.packets.splitMessage(message, source, destination);

  simulation.schedule(packets.map((packet) => ({
    kind: SIMULATION_EVENT_KIND.PACKET_SENT,
    data: {
      from: null,
      thisNode: source,
      packet,
    },
    eta: PACKET_SPLIT_DELAY,
  })));
}
