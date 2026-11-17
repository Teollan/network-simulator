import { LINK_TYPE } from '@/modules/network/Link';
import { NETWORK_BUILDER_ACTION, type TopologyRecipeStepOf } from '@/modules/network/builder/NetworkRecipe';
import type { Network } from '@/modules/network/Network';
import { shuffle } from '@/modules/util/shuffle';

type AssignLinkTypeStep = TopologyRecipeStepOf<typeof NETWORK_BUILDER_ACTION.ASSIGN_LINK_TYPE>;

// INFO: makes exactly round(share * n) of the matching links half-duplex, the rest full-duplex
export function assignLinkType(network: Network, { halfDuplexShare, medium }: AssignLinkTypeStep) {
  if (halfDuplexShare < 0 || halfDuplexShare > 1) {
    throw new Error(`Half-duplex share must be within [0, 1], got ${halfDuplexShare}`);
  }

  const links = shuffle(network.getLinks({ medium }));
  const halfDuplexCount = Math.round(halfDuplexShare * links.length);

  network.updateManyLinks(links.map((link, idx) => ({
    id: link.id,
    type: idx < halfDuplexCount ? LINK_TYPE.HALF_DUPLEX : LINK_TYPE.FULL_DUPLEX,
  })));
}
