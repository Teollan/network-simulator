import { useMemo } from 'react';
import { describeEvent } from '@/components/editor/aside/tabs/trace/describeEvent';
import { Trace, TraceDescription, TraceIcon, TraceLine, TraceTitle } from '@/components/ui/Trace';
import type { SimulationEvent } from '@/modules/simulation/SimulationEvent';
import { useNetworkStore } from '@/stores/useNetworkStore';

interface TraceEventListProps {
  events: SimulationEvent[];
}

export const TraceEventList = ({ events }: TraceEventListProps) => {
  const { networkLayout } = useNetworkStore();

  const labelsById = useMemo(() => new Map(
    networkLayout?.network.nodes.map(({ id, label }) => [id, label]),
  ), [networkLayout]);

  const getLabel = (nodeId: number) => labelsById.get(nodeId) ?? `#${nodeId}`;

  if (!events.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No events yet. Run a simulation to record a trace.
      </p>
    );
  }

  return (
    <Trace>
      {events.map((event, idx) => {
        const { icon: Icon, title, isError } = describeEvent(event, getLabel);

        return (
          <TraceLine
            key={idx}
            status={isError ? 'error' : undefined}
          >
            <TraceDescription className="w-14 text-right font-mono text-xs">
              {event.time.toFixed(2)}
            </TraceDescription>

            <TraceIcon>
              <Icon />
            </TraceIcon>

            <TraceTitle>
              {title}
            </TraceTitle>
          </TraceLine>
        );
      })}
    </Trace>
  );
};
