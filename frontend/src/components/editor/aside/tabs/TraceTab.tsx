import { AsideSection } from '@/components/editor/aside/AsideSection';
import { TraceEventList } from '@/components/editor/aside/tabs/trace/TraceEventList';
import { useTraceStore } from '@/stores/useTraceStore';

export const TraceTab = () => {
  const { events } = useTraceStore();

  return (
    <AsideSection
      title="Trace"
      description="Events recorded during the last run."
    >
      <TraceEventList events={events} />
    </AsideSection>
  );
};
