import {
  isEventOfKind,
  SIMULATION_EVENT_KIND,
  type SimulationEvent,
} from '@/modules/simulation/events/SimulationEvent';
import type { Frame } from '@/modules/traffic/Frame';
import { notNull } from '@/modules/util/functional';

export interface FrameInFlight {
  frame: Frame;
  progress: number; // 0 to 1
}

export interface Snapshot {
  framesInFlightByLinkId: Map<number, FrameInFlight[]>
}

type FrameEventPair = readonly [
  SimulationEvent<typeof SIMULATION_EVENT_KIND.FRAME_SENT>,
  SimulationEvent<typeof SIMULATION_EVENT_KIND.FRAME_RECEIVED>,
];

export class Timeline {
  private trace: SimulationEvent[];
  private frameEventPairs: FrameEventPair[];

  constructor(trace: SimulationEvent[]) {
    this.trace = trace;

    const sentEvents = this.trace.filter(isEventOfKind(SIMULATION_EVENT_KIND.FRAME_SENT));
    const receivedEvents = this.trace.filter(isEventOfKind(SIMULATION_EVENT_KIND.FRAME_RECEIVED));

    this.frameEventPairs = sentEvents.map((sentEvent) => {
      const receivedEvent = receivedEvents.find((event) => (
        event.data.frame === sentEvent.data.frame
      ));

      if (!receivedEvent) {
        return null;
      }

      return [sentEvent, receivedEvent] as const;
    }).filter(notNull);
  }

  snapshotAt(time: number): Snapshot {
    return {
      framesInFlightByLinkId: this.findFramesInFlight(time),
    };
  }

  private findFramesInFlight(time: number): Map<number, FrameInFlight[]> {
    const inFlightEventPairs = this.frameEventPairs.filter(([sentEvent, receivedEvent]) => (
      sentEvent.time <= time && time < receivedEvent.time
    ));

    const framesInFlight = inFlightEventPairs.reduce((acc, eventPair) => {
      const [sentEvent, receivedEvent] = eventPair;
      const { frame } = sentEvent.data;
      const { source, destination } = sentEvent.data.frame;

      const link = source.getLinkTo(destination);

      if (!acc.has(link.id)) {
        acc.set(link.id, []);
      }

      const progress = (time - sentEvent.time) / (receivedEvent.time - sentEvent.time);

      acc.get(link.id)!.push({
        frame,
        progress,
      });

      return acc;
    }, new Map<number, FrameInFlight[]>());

    return framesInFlight;
  }
}
