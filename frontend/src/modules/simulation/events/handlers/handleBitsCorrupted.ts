import type {
  SIMULATION_EVENT_KIND,
  SimulationEvent,
} from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

export function handleBitsCorrupted(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.BITS_CORRUPTED>,
  _: Simulation,
) {
  const { frame } = event.data;

  frame.isCorrupted = true;
}
