import type { NetworkFrame } from '@/modules/network/model/NetworkFrame';
import type { NetworkNode } from '@/modules/network/model/NetworkNode';
import type { RoutingPolicy, RoutingPolicyContext } from '@/modules/routing/model/RoutingPolicy';
import type { SimulationNodeState } from '@/modules/simulation/model/SimulationNodeState';

// TODO: *IT IS BROKEN* 
// i'll fix it later
// gets lost when hitting a dead end during a random walk
export class HotPotatoRP implements RoutingPolicy<SimulationNodeState> {
  initState(node: NetworkNode, _ctx: RoutingPolicyContext): SimulationNodeState {
    return { model: node };
  }

  onPacket(state: SimulationNodeState, frame: NetworkFrame, ctx: RoutingPolicyContext) {
    const senderId = frame.sourceId;
    const receiverId = frame.destinationId;

    const targets = ctx.network
      .getAdjacentNodes(receiverId)
      .filter((node) => node.id !== senderId);

    if (!targets.length) {
      return {
        state: {
          ...state,
        },
        destinationIds: [],
      };
    }

    // a busy link has one more frame on the wire ahead of the queue
    const getBufferLength = (targetId: number) => {
      const link = ctx.network.getLinkBetween(receiverId, targetId);
      const linkState = link && ctx.linkStatesByLinkId.get(link.id);

      if (!linkState) {
        return 0;
      }

      return linkState.queue.length + (linkState.isBusy ? 1 : 0);
    };

    const targetWithSmallestBuffer = targets.sort((a, b) => (
      getBufferLength(a.id) - getBufferLength(b.id)
    ))[0];

    return {
      state: {
        ...state,
      },
      destinationIds: [targetWithSmallestBuffer.id],
    };
  }
};
