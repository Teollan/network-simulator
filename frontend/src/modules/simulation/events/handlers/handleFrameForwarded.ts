import { SIMULATION_EVENT_KIND, type SimulationEvent } from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

export function handleFrameForwarded(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.FRAME_FORWARDED>,
  simulation: Simulation,
) {
  const { frame } = event.data;

  const link = frame.source.getLinkTo(frame.destination);

  if (link.isBusy) {
    const buffer = frame.source.getBufferTo(frame.destination);

    buffer.push(frame);
  } else {
    link.isBusy = true;

    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.FRAME_SENT,
      data: { frame },
      eta: 0,
    });
  }
}
