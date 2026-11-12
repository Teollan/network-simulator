import { NETWORK_BUILDER_ACTION, type TopologyRecipeStepOf } from '@/modules/network/builder/NetworkRecipe';
import type { Network } from '@/modules/network/Network';

type SpawnRegionStep = TopologyRecipeStepOf<typeof NETWORK_BUILDER_ACTION.SPAWN_REGION>;

export function spawnRegion(network: Network, action: SpawnRegionStep) {
  const region = network.createRegion({
    label: action.region,
  });

  network.createManyNodes(Array.from({ length: action.count }, (_, i) => ({
    label: `${region.label}-${i}`,
    regionId: region.id,
  })));
}
