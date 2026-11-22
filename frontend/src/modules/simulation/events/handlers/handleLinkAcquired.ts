import {
  SIMULATION_EVENT_KIND,
  type SimulationEvent,
} from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

export function handleLinkAcquired(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.LINK_ACQUIRED>,
  simulation: Simulation,
) {
  const { source, destination } = event.data;

  const link = source.getLinkTo(destination);

  if (link.isBusy) {
    // TODO: naming - LINK_ACQUIRED reads like it always acquires, but it may not:
    // both ends of a shared half-duplex line can request it at the same moment,
    // and the loser finds the line busy and defers, like carrier sense in CSMA.
    // Its frame stays buffered and LINK_RELEASED hands the line over later.
    return;
  }

  link.isBusy = true;

  const sourceBuffer = source.getBufferTo(destination);
  const frame = sourceBuffer.pop();

  if (!frame) {
    throw Error('The buffer was drained before the acquire!');
  }

  simulation.schedule({
    kind: SIMULATION_EVENT_KIND.FRAME_SENT,
    data: { frame },
    eta: 0,
  });
}
