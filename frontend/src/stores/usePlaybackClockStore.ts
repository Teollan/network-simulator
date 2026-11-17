import { create } from 'zustand';

// Time changes on every animation frame, so it lives in its own store.
// Only components that render time-dependent things (packets, the time readout)
// should use this one, everything else stays on usePlaybackStore and never
// re-renders during playback.
interface PlaybackClockStore {
  time: number;
}

export const usePlaybackClockStore = create<PlaybackClockStore>()(() => ({
  time: 0,
}));
