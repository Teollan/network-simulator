import type { Network } from '@/modules/network/Network';
import {
  getLinkComplement,
  isLinkWith,
} from '@/modules/network/network.helpers';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';
import {
  makeStatefulLink,
  type IsBusy,
  type StatefulLink,
} from '@/modules/simulation/state/StatefulLink';
import { StatefulNode } from '@/modules/simulation/state/StatefulNode';

export class StatefulNetwork {
  private readonly nodes: StatefulNode[] = [];
  private readonly links: StatefulLink<IsBusy>[] = [];

  constructor(network: Network) {
    this.nodes = network.getNodes().map((node) => new StatefulNode(node));
    this.links = network.getLinks().map(makeStatefulLink);

    for (const source of this.nodes) {
      const nodeLinks = this.getLinksWith(source.id);

      const connections = nodeLinks.map((link) => {
        const destination = this.getNode(getLinkComplement(source.id)(link));

        return {
          link,
          destination,
        };
      });

      for (const { link, destination } of connections) {
        source.addLinkTo(destination, link);
      }
    }
  }

  getNode(id: number): StatefulNode {
    const node = this.nodes.find((node) => node.id === id);

    if (!node) {
      throw Error(`Node with id [${id}] does not exist!`);
    }

    return node;
  }

  getWorkstation(id: number): StatefulNode {
    const node = this.getNode(id);

    if (node.type !== NODE_TYPE.WORKSTATION) {
      throw Error(`Node with id [${id}] is not a WORKSTATION`);
    }

    return node;
  }

  getLinksWith(nodeId: number) {
    return this.links.filter(isLinkWith(nodeId));
  }
}
