import {
  SIMULATION_EVENT_KIND,
  type SimulationEvent,
} from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

export function pollTrafficGenerator(
  event: SimulationEvent<typeof SIMULATION_EVENT_KIND.MESSAGE_SENT>,
  simulation: Simulation,
) {
  const { generator } = event.data;

  if (!generator) {
    return;
  }

  simulation.scheduleTransmission(generator);
}
