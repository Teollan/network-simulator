import { NETWORK_BUILDER_ACTION, type TopologyRecipeStepOf } from '@/modules/network/builder/NetworkRecipe';
import type { Network } from '@/modules/network/Network';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';

type AttachWorkstationsStep = TopologyRecipeStepOf<typeof NETWORK_BUILDER_ACTION.ATTACH_WORKSTATIONS>;

export function attachWorkstations(network: Network, action: AttachWorkstationsStep) {
  const routers = network.getNodesByRegionLabel(action.region).filter(
    (node) => node.type === NODE_TYPE.ROUTER,
  );

  const hosts = routers.filter((_, i) => (
    ((i + 1) % action.every) === 0
  ));

  const workstations = network.createManyNodes(hosts.map((router) => ({
    label: `${router.label}-WS`,
    regionId: router.regionId,
    type: NODE_TYPE.WORKSTATION,
  })));

  network.createManyLinks(hosts.map((router, i) => ({
    sourceId: router.id,
    targetId: workstations[i].id,
  })));
}
