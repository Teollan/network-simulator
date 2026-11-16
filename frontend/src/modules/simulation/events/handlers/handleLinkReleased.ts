import { LINK_TYPE } from '@/modules/network/Link';
import { SIMULATION_EVENT_KIND, type SimulationEvent } from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';
import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';

const TURNAROUND_DELAY = 0.5;

export function handleLinkReleased(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.LINK_RELEASED>,
  simulation: Simulation,
) {
  const { source, destination } = event.data;

  const link = source.getLinkTo(destination);

  if (!link.isBusy) {
    throw Error(`Link between [${source.label}] and [${destination.label}] is already free!`);
  }

  switch (link.type) {
    case LINK_TYPE.FULL_DUPLEX:
      releaseFullDuplexLink(source, destination, simulation);
      break;

    case LINK_TYPE.HALF_DUPLEX:
      releaseHalfDuplexLink(source, destination, simulation);
      break;
  }
}

function releaseFullDuplexLink(
  source: StatefulNode,
  destination: StatefulNode,
  simulation: Simulation,
) {
  const sourceBuffer = source.getBufferTo(destination);
  const frame = sourceBuffer.pop();

  if (frame) {
    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.FRAME_SENT,
      data: { frame },
      eta: 0,
    });
  } else {
    // INFO: link is a proxy, treating
    // a full-duplex link as 2 simplex links in opposite directions
    const link = source.getLinkTo(destination);

    link.isBusy = false;
  }
}

function releaseHalfDuplexLink(
  source: StatefulNode,
  destination: StatefulNode,
  simulation: Simulation,
) {
  const destinationBuffer = destination.getBufferTo(source);
  const oppositeDirectionFrame = destinationBuffer.pop();

  if (oppositeDirectionFrame) {
    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.FRAME_SENT,
      data: { frame: oppositeDirectionFrame },
      eta: TURNAROUND_DELAY,
    });

    return;
  }

  const sourceBuffer = source.getBufferTo(destination);
  const sameDirectionFrame = sourceBuffer.pop();

  if (sameDirectionFrame) {
    simulation.schedule({
      kind: SIMULATION_EVENT_KIND.FRAME_SENT,
      data: { frame: sameDirectionFrame },
      eta: 0,
    });

    return;
  }

  const link = source.getLinkTo(destination);

  link.isBusy = false;
}
