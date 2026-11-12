import { RefreshCw } from 'lucide-react';
import { AsideSection } from '@/components/editor/aside/AsideSection';
import { Button } from '@/components/ui/Button';
import { useNetworkStore } from '@/stores/useNetworkStore';

export const NetworkTab = () => {
  const {
    networkLayout,
    isGenerating,
    generateNetwork,
  } = useNetworkStore();

  const nodeCount = networkLayout?.network.getNodes().length ?? 0;
  const linkCount = networkLayout?.network.getLinks().length ?? 0;
  const actualDegree = nodeCount ? (2 * linkCount) / nodeCount : 0;

  return (
    <AsideSection
      title="Network"
      description="Topology generation."
    >
      <Button
        onClick={generateNetwork}
        disabled={isGenerating}
      >
        <RefreshCw />
        Generate
      </Button>

      <p className="text-xs text-muted-foreground">
        {`${nodeCount} routers · ${linkCount} links · degree ${actualDegree.toFixed(2)}`}
      </p>
    </AsideSection>
  );
};
