import Elk from 'elkjs/lib/elk.bundled.js';
import type { ElkNode } from 'elkjs';
import type { XYPosition } from '@xyflow/react';
import { networkLinkToElkEdge } from '@/modules/layout/networkLinkToElkEdge';
import { networkNodeToElkNode } from '@/modules/layout/networkNodeToElkNode';
import { ELK_LAYOUT_OPTIONS } from '@/modules/layout/layout.constants';
import type { Network } from '@/modules/network/Network';

const elk = new Elk();

export type LayoutPositions = Map<number, XYPosition>;

export const layoutNetwork = async (network: Network): Promise<LayoutPositions> => {
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: ELK_LAYOUT_OPTIONS.STRESS,
    children: network.nodes.map(networkNodeToElkNode),
    edges: network.links.map(networkLinkToElkEdge),
  };

  const { children = [] } = await elk.layout(graph);

  return new Map(children.map(({ id, x = 0, y = 0 }) => [Number(id), { x, y }]));
};
