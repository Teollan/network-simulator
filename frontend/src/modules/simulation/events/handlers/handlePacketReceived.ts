import { PACKET_DROP_REASON, SIMULATION_EVENT_KIND, type SimulationEvent } from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

const PROPAGATION_DELAY = 0;

export function handlePacketReceived(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_RECEIVED>,
  simulation: Simulation,
) {
  const { thisNode, from, packet } = event.data;

  if (packet.destination === thisNode) {
    const message = thisNode.consumePacket(packet);

    if (message) {
      simulation.schedule({
        kind: SIMULATION_EVENT_KIND.MESSAGE_RECEIVED,
        data: {
          message,
          thisNode,
        },
        eta: 0,
      });
    }
  }

  if (packet.hopLimit === 0) {
    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_DROPPED,
      data: {
        packet,
        thisNode,
        reason: PACKET_DROP_REASON.HOP_LIMIT,
      },
      eta: 0,
    });

    return;
  }

  simulation.schedule({
    kind: SIMULATION_EVENT_KIND.PACKET_SENT,
    data: {
      from,
      thisNode,
      packet,
    },
    eta: PROPAGATION_DELAY,
  });
}
