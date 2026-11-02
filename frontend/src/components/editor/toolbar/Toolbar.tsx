import { Play, RefreshCw, SkipBack, SkipForward, StepBack, StepForward, Zap } from 'lucide-react';
import { DEFAULT_PLAYBACK_SPEED, PLAYBACK_SPEEDS } from '@/components/editor/toolbar/toolbar.constants';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Separator } from '@/components/ui/Separator';

export const Toolbar = () => (
  <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-3">
    <Button variant="outline" size="sm">
      <RefreshCw />
      Generate
    </Button>

    <Button size="sm">
      <Zap />
      Run
    </Button>

    <Separator orientation="vertical" className="mx-1 h-6" />

    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-sm" aria-label="Jump to start" title="Jump to start">
        <SkipBack />
      </Button>

      <Button variant="ghost" size="icon-sm" aria-label="Previous event" title="Previous event">
        <StepBack />
      </Button>

      <Button variant="ghost" size="icon-sm" aria-label="Play" title="Play">
        <Play />
      </Button>

      <Button variant="ghost" size="icon-sm" aria-label="Next event" title="Next event">
        <StepForward />
      </Button>

      <Button variant="ghost" size="icon-sm" aria-label="Jump to end" title="Jump to end">
        <SkipForward />
      </Button>
    </div>

    <Select defaultValue={`${DEFAULT_PLAYBACK_SPEED}`}>
      <SelectTrigger size="sm" className="w-20" aria-label="Playback speed">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {PLAYBACK_SPEEDS.map((speed) => (
          <SelectItem key={speed} value={`${speed}`}>
            {speed}×
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </header>
);
