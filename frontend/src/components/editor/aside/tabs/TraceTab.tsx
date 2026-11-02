import { AsideSection } from '@/components/editor/aside/AsideSection';
import { TraceEventList } from '@/components/editor/aside/tabs/trace/TraceEventList';

export const TraceTab = () => (
  <AsideSection
    title="Trace"
    description="Events recorded during the last run."
  >
    <TraceEventList events={[]} />
  </AsideSection>
);
