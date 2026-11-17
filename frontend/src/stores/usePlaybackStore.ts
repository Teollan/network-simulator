import { create } from 'zustand';
import { DEFAULT_PLAYBACK_SPEED } from '@/components/editor/toolbar/toolbar.constants';
import { Timeline } from '@/modules/playback/Timeline';
import { clamp } from '@/modules/util/functional';
import type { SimulationEvent } from '@/modules/simulation/events/SimulationEvent';
import { usePlaybackClockStore } from '@/stores/usePlaybackClockStore';
import { useTraceStore } from '@/stores/useTraceStore';

const getTime = () => usePlaybackClockStore.getState().time;
const setTime = (time: number) => usePlaybackClockStore.setState({ time });

interface PlaybackStore {
  timeline: Timeline | null;
  eventTimes: number[];
  endTime: number;
  isPlaying: boolean;
  speed: number;

  load: (trace: SimulationEvent[]) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  stepForward: () => void;
  stepBack: () => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;
  setSpeed: (speed: number) => void;
}

let animationFrameId: number | null = null;
let lastFrameAt = 0;

const stopLoop = () => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

export const usePlaybackStore = create<PlaybackStore>()((set, get) => ({
  timeline: null,
  eventTimes: [],
  endTime: 0,
  isPlaying: false,
  speed: DEFAULT_PLAYBACK_SPEED,

  load: (trace) => {
    stopLoop();

    const eventTimes = [...new Set(trace.map(({ time }) => time))];

    set({
      timeline: trace.length ? new Timeline(trace) : null,
      eventTimes,
      endTime: eventTimes.at(-1) ?? 0,
      isPlaying: false,
    });

    setTime(0);
  },

  play: () => {
    const { timeline, isPlaying, endTime } = get();

    if (!timeline || isPlaying) {
      return;
    }

    if (getTime() >= endTime) {
      setTime(0);
    }

    set({ isPlaying: true });

    const tick = (now: number) => {
      const { speed, endTime, pause } = get();
      const time = Math.min(getTime() + ((now - lastFrameAt) / 1000) * speed, endTime);

      lastFrameAt = now;
      setTime(time);

      if (time >= endTime) {
        pause();

        return;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    lastFrameAt = performance.now();
    animationFrameId = requestAnimationFrame(tick);
  },

  pause: () => {
    stopLoop();
    set({ isPlaying: false });
  },

  togglePlay: () => {
    const { isPlaying, play, pause } = get();

    if (isPlaying) {
      pause();
    } else {
      play();
    }
  },

  seek: (time) => {
    const { endTime } = get();

    setTime(clamp(time, 0, endTime));
  },

  stepForward: () => {
    const { eventTimes, pause } = get();
    const next = eventTimes.find((eventTime) => eventTime > getTime());

    pause();

    if (next !== undefined) {
      setTime(next);
    }
  },

  stepBack: () => {
    const { eventTimes, pause } = get();
    const previous = eventTimes.findLast((eventTime) => eventTime < getTime());

    pause();
    setTime(previous ?? 0);
  },

  jumpToStart: () => {
    get().pause();
    setTime(0);
  },

  jumpToEnd: () => {
    const { endTime, pause } = get();

    pause();
    setTime(endTime);
  },

  setSpeed: (speed) => set({ speed }),
}));

useTraceStore.subscribe((state, previousState) => {
  if (state.events !== previousState.events) {
    usePlaybackStore.getState().load(state.events);
  }
});
