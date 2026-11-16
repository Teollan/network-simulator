import type { SimulationEvent, SimulationEventKind } from '@/modules/simulation/events/SimulationEvent';
import type { Simulation } from '@/modules/simulation/Simulation';

export type SimulationEventHandler<K extends SimulationEventKind> = (
  event: SimulationEvent<K>,
  simulation: Simulation
) => void;
