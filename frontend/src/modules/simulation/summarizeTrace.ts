import { SIMULATION_EVENT_KIND, type SimulationEvent } from '@/modules/simulation/SimulationEvent';

export interface TraceSummary {
  eventCount: number;
  deliveredCount: number;
  droppedCount: number;
}

export const summarizeTrace = (trace: SimulationEvent[]): TraceSummary => {
  let deliveredCount = 0;
  let droppedCount = 0;

  for (const event of trace) {
    if (event.kind === SIMULATION_EVENT_KIND.PACKET_DROPPED) {
      droppedCount++;
    }

    if (
      event.kind === SIMULATION_EVENT_KIND.PACKET_RECEIVED
      && event.data.frame.packet.destinationId === event.data.frame.destinationId
    ) {
      deliveredCount++;
    }
  }

  return { eventCount: trace.length, deliveredCount, droppedCount };
};
