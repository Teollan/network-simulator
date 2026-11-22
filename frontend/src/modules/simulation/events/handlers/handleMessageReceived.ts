import type {
  SIMULATION_EVENT_KIND,
  SimulationEvent,
} from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

export function handleMessageReceived(
  _event: SimulationEvent<typeof SIMULATION_EVENT_KIND.MESSAGE_RECEIVED>,
  _simulation: Simulation,
) {
  // TODO: do something...
}
