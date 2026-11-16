import type { SIMULATION_EVENT_KIND, SimulationEvent } from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

export function handlePacketDropped(
  _event: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_DROPPED>,
  _simulation: Simulation,
) {
  // TODO: do something...
}
