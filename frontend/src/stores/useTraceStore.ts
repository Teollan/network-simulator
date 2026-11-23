import { create } from 'zustand';
import type { SimulationEvent } from '@/modules/simulation/events/SimulationEvent';

interface TraceStore {
  seed: number | null;
  events: SimulationEvent[];

  setEvents: (events: SimulationEvent[], seed: number) => void;
  clearEvents: () => void;
}

export const useTraceStore = create<TraceStore>()((set) => ({
  seed: null,
  events: [],

  setEvents: (events, seed) => set({
    seed,
    events,
  }),
  clearEvents: () => set({
    seed: null,
    events: [],
  }),
}));
