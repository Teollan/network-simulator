import type { Frame } from '@/modules/traffic/Frame';
import type { RoutingPolicy, RoutingPolicyContext } from '@/modules/routing/RoutingPolicy';
import { shuffle } from '@/modules/util/shuffle';
import type { Node } from '@/modules/network/Node';
import { isLinkBusy } from '@/modules/simulation/state/StatefulLink';

export class HotPotatoRP implements RoutingPolicy<null> {
  initState(_: Node, __: RoutingPolicyContext): null {
    return null;
  }

  onPacket(frame: Frame, ctx: RoutingPolicyContext) {
    const senderId = frame.sourceId;
    const receiver = ctx.network.getNode(frame.destinationId);

    const targetIds = ctx.network
      .getLinkedNodes(receiver.id)
      .map((node) => node.id)
      .filter((id) => id !== senderId);

    if (!targetIds.length) {
      return [senderId];
    }

    if (targetIds.includes(frame.packet.destinationId)) {
      return [frame.packet.destinationId];
    }

    const getBufferLength = (targetId: number) => {
      const link = ctx.network.getLinkBetween(receiver.id, targetId);

      const bufferLength = receiver.buffers.to(targetId).length;

      return bufferLength + (isLinkBusy(link, receiver.id) ? 1 : 0);
    };

    const targetWithSmallestBufferId = shuffle(targetIds).sort((a, b) => (
      getBufferLength(a) - getBufferLength(b)
    ))[0];

    return [targetWithSmallestBufferId];
  }
};
