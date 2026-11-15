import { LINK_TYPE } from '@/modules/network/Link';
import type { Network } from '@/modules/network/Network';
import { getLinkComplement, isLinkWith } from '@/modules/network/network.helpers';
import { NodeBuffers } from '@/modules/simulation/state/NodeBuffers';
import { type StatefulLink } from '@/modules/simulation/state/StatefulLink';
import { type StatefulNode } from '@/modules/simulation/state/StatefulNode';
import type { Frame } from '@/modules/traffic/Frame';
import { pick } from '@/modules/util/functional';

export class StatefulNetwork {
  private readonly nodes: StatefulNode[] = [];
  private readonly links: StatefulLink[] = [];

  constructor(network: Network) {
    this.nodes = network.getNodes().map((node) => ({
      ...node,
      buffers: new NodeBuffers(
        network.getLinkedNodes(node.id).map(pick('id')),
        Infinity, // TODO: take this from the node
      ),
    }));

    this.links = network.getLinks().map((link): StatefulLink => {
      switch (link.type) {
        case LINK_TYPE.HALF_DUPLEX:
          return {
            ...link,
            type: LINK_TYPE.HALF_DUPLEX,
            isBusy: false,
          };

        case LINK_TYPE.FULL_DUPLEX:
          return {
            ...link,
            type: LINK_TYPE.FULL_DUPLEX,
            isBusy: {
              direct: false,
              inverse: false,
            },
          };
      }
    });
  }

  // === NODE === 
  getNode(nodeId: number): StatefulNode {
    const result = this.nodes.find((node) => node.id === nodeId);

    if (!result) {
      throw Error(`Node with id [${nodeId}] does not exist!`);
    }

    return result;
  }

  getLinkedNodes(nodeId: number): StatefulNode[] {
    const { nodes, links } = this;

    const nodeLinks = links.filter(isLinkWith(nodeId));
    const linkedNodeIds = nodeLinks.map(getLinkComplement(nodeId));

    return nodes.filter(({ id }) => linkedNodeIds.includes(id));
  }

  // === LINK === 
  getLinkBetween(a: number, b: number): StatefulLink {
    const { links } = this;

    const result = links.find((link) => {
      const withA = isLinkWith(a)(link);
      const withB = isLinkWith(b)(link);

      return withA && withB;
    });

    if (!result) {
      throw Error(`Link between nodes [${a}] and [${b}] does not exist!`);
    }

    return result;
  }

  updateLinkIsBusy(linkId: number, sourceId: number, isBusy: boolean) {
    const link = this.links.find((link) => link.id === linkId);

    if (!link) {
      throw Error(`Link with id [${linkId}] does not exist!`);
    }

    switch (link.type) {
      case LINK_TYPE.HALF_DUPLEX:
        link.isBusy = isBusy;
        break;

      case LINK_TYPE.FULL_DUPLEX:
        if (link.sourceId === sourceId) {
          link.isBusy.direct = isBusy;
        } else {
          link.isBusy.inverse = isBusy;
        }
        break;
    }
  }

  // === MISC ===
  pushFrame(frame: Frame) {
    const source = this.getNode(frame.sourceId);

    source.buffers.to(frame.destinationId).push(frame);
  }

  popFrame(sourceId: number, destinationId: number): Frame | null {
    const source = this.getNode(sourceId);

    return source.buffers.to(destinationId).pop();
  }
}
