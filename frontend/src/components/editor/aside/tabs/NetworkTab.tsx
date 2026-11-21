import { RefreshCw } from 'lucide-react';
import { AsideSection } from '@/components/editor/aside/AsideSection';
import { Button } from '@/components/ui/Button';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';
import { useNetworkStore } from '@/stores/useNetworkStore';

export const NetworkTab = () => {
  const {
    networkLayout,
    isGenerating,
    generateNetwork,
  } = useNetworkStore();

  const nodes = networkLayout?.network.getNodes() ?? [];
  const routerCount = nodes.filter(({ type }) => type === NODE_TYPE.ROUTER).length;
  const workstationCount = nodes.filter(({ type }) => type === NODE_TYPE.WORKSTATION).length;
  const linkCount = networkLayout?.network.getLinks().length ?? 0;
  const actualDegree = nodes.length ? (2 * linkCount) / nodes.length : 0;

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
        {`${routerCount} routers · ${workstationCount} workstations · ${linkCount} links · degree ${actualDegree.toFixed(2)}`}
      </p>
    </AsideSection>
  );
};
