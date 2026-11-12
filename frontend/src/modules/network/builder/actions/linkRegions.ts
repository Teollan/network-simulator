import { LINK_MEDIUM } from '@/modules/network/Link';
import { NETWORK_BUILDER_ACTION, type TopologyRecipeStepOf } from '@/modules/network/builder/NetworkRecipe';
import type { Network } from '@/modules/network/Network';

type LinkRegionsStep = TopologyRecipeStepOf<typeof NETWORK_BUILDER_ACTION.LINK_REGIONS>;

export function linkRegions(network: Network, { sourceRegion, targetRegion }: LinkRegionsStep) {
  const sourceNodes = network.getNodesByRegionLabel(sourceRegion);
  const targetNodes = network.getNodesByRegionLabel(targetRegion);

  if (sourceNodes.length === 0 || targetNodes.length === 0) {
    throw new Error(`Cannot link empty region "${sourceNodes.length === 0 ? sourceRegion : targetRegion}"`);
  }

  const randomSourceNode = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];
  const randomTargetNode = targetNodes[Math.floor(Math.random() * targetNodes.length)];

  network.createLink({
    sourceId: randomSourceNode.id,
    targetId: randomTargetNode.id,
    medium: LINK_MEDIUM.SATELLITE,
  });
}
