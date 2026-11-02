import { RefreshCw } from 'lucide-react';
import { AsideSection } from '@/components/editor/aside/AsideSection';
import { onNumberChange } from '@/components/editor/aside/onNumberChange';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useNetworkStore } from '@/stores/useNetworkStore';

export const NetworkTab = () => {
  const {
    networkConfig,
    networkLayout,
    isGenerating,
    setNetworkConfig,
    generateNetwork,
  } = useNetworkStore();

  const nodeCount = networkLayout?.network.nodes.length ?? 0;
  const linkCount = networkLayout?.network.links.length ?? 0;
  const actualDegree = nodeCount ? (2 * linkCount) / nodeCount : 0;

  return (
    <AsideSection
      title="Network"
      description="Topology generation: routers per region, average degree and link weights."
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="routers-per-region">
          Routers per region
        </Label>

        <Input
          id="routers-per-region"
          type="number"
          min={2}
          step={1}
          defaultValue={networkConfig.routersPerRegion}
          onChange={onNumberChange((routersPerRegion) => setNetworkConfig({ routersPerRegion }))}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="average-degree">
          Average degree
        </Label>

        <Input
          id="average-degree"
          type="number"
          min={1}
          step={0.1}
          defaultValue={networkConfig.averageDegree}
          onChange={onNumberChange((averageDegree) => setNetworkConfig({ averageDegree }))}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>
          Link weights
        </Label>

        <p className="text-sm text-muted-foreground">
          {networkConfig.weightPool.join(', ')}
        </p>
      </div>

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
