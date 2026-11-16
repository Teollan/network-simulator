import type { RoutingOptions, RoutingPolicy } from '@/modules/routing/RoutingPolicy';
import { shuffle } from '@/modules/util/shuffle';
import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';

export class HotPotatoRP implements RoutingPolicy {
  route({
    thisNode,
    source,
    destination,
  }: RoutingOptions) {
    const candidates = thisNode
      .getAdjacentNodes()
      .filter((node) => node !== source);

    if (!candidates.length) {
      return source ? [source] : [];
    }

    if (candidates.includes(destination)) {
      return [destination];
    }

    const getBufferLength = (candidate: StatefulNode) => {
      const link = thisNode.getLinkTo(candidate);
      const buffer = thisNode.getBufferTo(candidate);

      return buffer.length + (link.isBusy ? 1 : 0);
    };

    const bestCandidate = shuffle(candidates).sort((a, b) => (
      getBufferLength(a) - getBufferLength(b)
    ))[0];

    return [bestCandidate];
  }
};
