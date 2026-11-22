import {
  SIMULATION_EVENT_KIND,
  type SimulationEvent,
} from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';


const GROUND_PROPAGATION_DELAY = 1;

// TODO: account for transmission delay
export function handleFrameSent(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.FRAME_SENT>,
  simulation: Simulation,
) {
  const { frame } = event.data;

  simulation.schedule({
    kind: SIMULATION_EVENT_KIND.FRAME_RECEIVED,
    data: { frame },
    eta: GROUND_PROPAGATION_DELAY, // TODO: account for link medium
  });
}

// function getTransmissionTime(frame: Frame, link: StatefulLink): number {
//   const bandwidth = BANDWIDTH_FACTOR / link.weight;

//   return (PACKET_HEADER_LENGTH + frame.packet.length) / bandwidth;
// }
