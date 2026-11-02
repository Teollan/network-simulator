import { Slider } from '@/components/ui/Slider';

export const Timeline = () => (
  <footer className="flex h-12 shrink-0 items-center gap-3 border-t bg-background px-3">
    <span className="w-16 font-mono text-xs tabular-nums text-muted-foreground">
      0.00
    </span>

    <Slider defaultValue={[0]} min={0} max={100} step={0.01} aria-label="Simulation time" />

    <span className="w-16 text-right font-mono text-xs tabular-nums text-muted-foreground">
      0.00
    </span>
  </footer>
);
