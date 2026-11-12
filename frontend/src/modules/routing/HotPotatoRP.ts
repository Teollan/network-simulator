import type { Frame } from '@/modules/traffic/Frame';
import type { RoutingPolicy, RoutingPolicyContext } from '@/modules/routing/RoutingPolicy';
import { shuffle } from '@/modules/util/shuffle';
import type { Node } from '@/modules/network/Node';

export class HotPotatoRP implements RoutingPolicy<null> {
  initState(_: Node, __: RoutingPolicyContext): null {
    return null;
  }

  onPacket(_: null, frame: Frame, ctx: RoutingPolicyContext) {
    const senderId = frame.sourceId;
    const receiverId = frame.destinationId;

    const targetIds = ctx.network
      .getLinkedNodes(receiverId)
      .map((node) => node.id)
      .filter((id) => id !== senderId);

    if (!targetIds.length) {
      return {
        state: null,
        destinationIds: [senderId],
      };
    }

    if (targetIds.includes(frame.packet.destinationId)) {
      return {
        state: null,
        destinationIds: [frame.packet.destinationId],
      };
    }

    const getBufferLength = (targetId: number) => {
      const link = ctx.network.findLinkBetween(receiverId, targetId);
      const linkState = link && ctx.linkStatesByLinkId.get(link.id);

      if (!linkState) {
        return 0;
      }

      return linkState.queue.length + (linkState.isBusy ? 1 : 0);
    };

    const targetWithSmallestBufferId = shuffle(targetIds).sort((a, b) => (
      getBufferLength(a) - getBufferLength(b)
    ))[0];

    return {
      state: null,
      destinationIds: [targetWithSmallestBufferId],
    };
  }
};
