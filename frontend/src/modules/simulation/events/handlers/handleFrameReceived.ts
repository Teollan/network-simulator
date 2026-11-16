import { LINK_TYPE } from '@/modules/network/Link';
import { SIMULATION_EVENT_KIND, type SimulationEvent } from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';
import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';

const FRAME_TO_PACKET_DELAY = 0;
const TURNAROUND_DELAY = 0.5;

export function handleFrameReceived(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.FRAME_RECEIVED>,
  simulation: Simulation,
) {
  const { frame } = event.data;

  const link = frame.source.getLinkTo(frame.destination);

  if (!link.isBusy) {
    throw Error('Frame received over a link, that was not acquired');
  }

  releaseLink(frame.source, frame.destination, simulation);

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

export function releaseLink(
  source: StatefulNode,
  destination: StatefulNode,
  simulation: Simulation,
) {
  const link = source.getLinkTo(destination);

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
  const link = source.getLinkTo(destination);

  // INFO: think of this as a proxy,
  // or a full-duplex link being just 2 simplex links in opposite directions
  link.isBusy = false;

  const sourceBuffer = source.getBufferTo(destination);
  const frame = sourceBuffer.pop();

  if (!frame) {
    return;
  }

  simulation.schedule({
    kind: SIMULATION_EVENT_KIND.FRAME_SENT,
    data: { frame },
    eta: 0,
  });
}

function releaseHalfDuplexLink(
  source: StatefulNode,
  destination: StatefulNode,
  simulation: Simulation,
) {
  const link = source.getLinkTo(destination);

  link.isBusy = false;

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
}
