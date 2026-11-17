import { Slider } from '@/components/ui/Slider';
import { usePlaybackClockStore } from '@/stores/usePlaybackClockStore';
import { usePlaybackStore } from '@/stores/usePlaybackStore';

// INFO: re-renders on every animation frame during playback, keep it small
export const Timeline = () => {
  const { time } = usePlaybackClockStore();
  const { timeline, endTime, seek } = usePlaybackStore();

  return (
    <footer className="flex h-12 shrink-0 items-center gap-3 border-t bg-background px-3">
      <span className="w-16 font-mono text-xs tabular-nums text-muted-foreground">
        {time.toFixed(2)}
      </span>

      <Slider
        value={[time]}
        onValueChange={([value]) => seek(value)}
        min={0}
        max={endTime}
        step={0.01}
        disabled={timeline === null}
        aria-label="Simulation time"
      />

      <span className="w-16 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {endTime.toFixed(2)}
      </span>
    </footer>
  );
};
