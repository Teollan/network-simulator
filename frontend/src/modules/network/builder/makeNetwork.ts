import { assignBitErrorRate } from '@/modules/network/builder/actions/assignBitErrorRate';
import { assignLinkWeights } from '@/modules/network/builder/actions/assignLinkWeights';
import { linkInsideRegion } from '@/modules/network/builder/actions/linkInsideRegion';
import { linkRegions } from '@/modules/network/builder/actions/linkRegions';
import { spawnRegion } from '@/modules/network/builder/actions/spawnRegion';
import { NETWORK_BUILDER_ACTION, type NetworkRecipe } from '@/modules/network/builder/NetworkRecipe';
import { Network } from '@/modules/network/Network';

export function makeNetwork({ actions }: NetworkRecipe) {
  const network = new Network();

  for (const action of actions) {
    switch (action.kind) {
      case NETWORK_BUILDER_ACTION.SPAWN_REGION:
        spawnRegion(network, action);
        break;
      case NETWORK_BUILDER_ACTION.LINK_INSIDE_REGION:
        linkInsideRegion(network, action);
        break;
      case NETWORK_BUILDER_ACTION.LINK_REGIONS:
        linkRegions(network, action);
        break;
      case NETWORK_BUILDER_ACTION.ASSIGN_LINK_WEIGHTS:
        assignLinkWeights(network, action);
        break;
      case NETWORK_BUILDER_ACTION.ASSIGN_BIT_ERROR_RATE:
        assignBitErrorRate(network, action);
        break;
    }
  }

  return network;
}
