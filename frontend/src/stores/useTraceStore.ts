import { create } from 'zustand';
import type { SimulationEvent } from '@/modules/simulation/SimulationEvent';

interface TraceStore {
  events: SimulationEvent[];

  setEvents: (events: SimulationEvent[]) => void;
  clearEvents: () => void;
}

export const useTraceStore = create<TraceStore>()((set) => ({
  events: [],

  setEvents: (events) => set({ events }),
  clearEvents: () => set({ events: [] }),
}));
