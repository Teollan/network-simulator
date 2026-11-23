import { AsideSection } from '@/components/editor/aside/AsideSection';
import { TraceEventList } from '@/components/editor/aside/tabs/trace/TraceEventList';
import { useTraceStore } from '@/stores/useTraceStore';

export const TraceTab = () => {
  const {
    events,
    seed,
  } = useTraceStore();

  return (
    <AsideSection
      title="Trace"
      description="Events recorded during the last run."
    >
      {seed !== null && (
        <p className="text-xs text-muted-foreground">
          {`seed ${seed}`}
        </p>
      )}

      <TraceEventList events={events} />
    </AsideSection>
  );
};
