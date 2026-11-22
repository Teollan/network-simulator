import type {
  RoutingOptions,
  RoutingPolicy,
} from '@/modules/routing/RoutingPolicy';
import type { Simulation } from '@/modules/simulation/Simulation';
import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';

export class HotPotatoRP implements RoutingPolicy {
  route(
    options: RoutingOptions,
    simulation: Simulation) {
    const { thisNode, source, destination } = options;

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

    const bestCandidate = simulation.random.shuffle(candidates).sort((a, b) => (
      getBufferLength(a) - getBufferLength(b)
    ))[0];

    return [bestCandidate];
  }
};
