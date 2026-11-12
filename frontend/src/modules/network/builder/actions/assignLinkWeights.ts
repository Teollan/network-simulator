import { NETWORK_BUILDER_ACTION, type TopologyRecipeStepOf } from '@/modules/network/builder/NetworkRecipe';
import type { Network } from '@/modules/network/Network';

type AssignLinkWeightsStep = TopologyRecipeStepOf<typeof NETWORK_BUILDER_ACTION.ASSIGN_LINK_WEIGHTS>;

export function assignLinkWeights(network: Network, { pool }: AssignLinkWeightsStep) {
  if (pool.length === 0) {
    throw new Error('Link weight pool is empty');
  }

  const links = network.getLinks();

  network.updateManyLinks(links.map((link) => ({
    id: link.id,
    weight: pool[Math.floor(Math.random() * pool.length)],
  })));
}
