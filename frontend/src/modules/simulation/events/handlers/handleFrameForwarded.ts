import {
  PACKET_DROP_REASON,
  SIMULATION_EVENT_KIND,
  type SimulationEvent,
} from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

export function handleFrameForwarded(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.FRAME_FORWARDED>,
  simulation: Simulation,
) {
  const { frame } = event.data;
  const { source, destination } = frame;

  const buffer = source.getBufferTo(destination);

  if (buffer.isFull()) {
    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_DROPPED,
      data: {
        packet: frame.packet,
        thisNode: source,
        reason: PACKET_DROP_REASON.BUFFER_OVERFLOW,
      },
      eta: 0,
    });

    return;
  }

  buffer.push(frame);

  if (buffer.length > 1) {
    return;
  }

  const link = source.getLinkTo(destination);

  if (!link.isBusy) {
    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.LINK_ACQUIRED,
      data: {
        source,
        destination,
      },
      eta: 0,
    });
  }
}
