import { NETWORK_BUILDER_ACTION, type TopologyRecipeStepOf } from '@/modules/network/builder/NetworkRecipe';
import type { Network } from '@/modules/network/Network';

type AssignBitErrorRateStep = TopologyRecipeStepOf<typeof NETWORK_BUILDER_ACTION.ASSIGN_BIT_ERROR_RATE>;

export function assignBitErrorRate(network: Network, { value, medium }: AssignBitErrorRateStep) {
  if (value < 0 || value > 1) {
    throw new Error(`Bit error rate must be within [0, 1], got ${value}`);
  }

  const links = network.getLinks({ medium });

  network.updateManyLinks(links.map((link) => ({
    id: link.id,
    bitErrorRate: value,
  })));
}
