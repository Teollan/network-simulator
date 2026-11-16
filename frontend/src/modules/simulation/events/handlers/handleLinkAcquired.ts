import { SIMULATION_EVENT_KIND, type SimulationEvent } from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

export function handleLinkAcquired(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.LINK_ACQUIRED>,
  simulation: Simulation,
) {
  const { source, destination } = event.data;

  const link = source.getLinkTo(destination);

  if (link.isBusy) {
    // TODO: this feels wrong
    // throw Error(`Link between nodes [${source.label}] and [${destination.label}] is busy!`);
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
