import {
  Pause,
  Play,
  RefreshCw,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
  Zap,
} from 'lucide-react';
import { PLAYBACK_SPEEDS } from '@/components/editor/toolbar/toolbar.constants';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Separator } from '@/components/ui/Separator';
import { useNetworkStore } from '@/stores/useNetworkStore';
import { usePlaybackStore } from '@/stores/usePlaybackStore';
import { useSimulationStore } from '@/stores/useSimulationStore';

export const Toolbar = () => {
  const {
    networkLayout,
    generateNetwork,
    isGenerating,
  } = useNetworkStore();

  const { runSimulation } = useSimulationStore();

  const {
    timeline,
    isPlaying,
    speed,
    togglePlay,
    stepForward,
    stepBack,
    jumpToStart,
    jumpToEnd,
    setSpeed,
  } = usePlaybackStore();

  const hasTimeline = timeline !== null;

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3">
      <Button
        variant="outline"
        size="sm"
        onClick={generateNetwork}
        disabled={isGenerating}
      >
        <RefreshCw />
        Generate
      </Button>

      <Button
        size="sm"
        onClick={runSimulation}
        disabled={!networkLayout}
      >
        <Zap />
        Run
      </Button>

      <Separator
        orientation="vertical"
        className="mx-1 h-6"
      />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Jump to start"
          title="Jump to start"
          onClick={jumpToStart}
          disabled={!hasTimeline}
        >
          <SkipBack />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Previous event"
          title="Previous event"
          onClick={stepBack}
          disabled={!hasTimeline}
        >
          <StepBack />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
          onClick={togglePlay}
          disabled={!hasTimeline}
        >
          {isPlaying ? <Pause /> : <Play />}
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Next event"
          title="Next event"
          onClick={stepForward}
          disabled={!hasTimeline}
        >
          <StepForward />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Jump to end"
          title="Jump to end"
          onClick={jumpToEnd}
          disabled={!hasTimeline}
        >
          <SkipForward />
        </Button>
      </div>

      <Select
        value={`${speed}`}
        onValueChange={(value) => setSpeed(Number(value))}
      >
        <SelectTrigger
          size="sm"
          className="w-20"
          aria-label="Playback speed"
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {PLAYBACK_SPEEDS.map((speed) => (
            <SelectItem
              key={speed}
              value={`${speed}`}
            >
              {`${speed}×`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </header>
  );
};
