import { networkConnectionToElkEdge } from '@/modules/layout/model/networkConnectionToElkEdge';
import { networkNodeToElkNode } from '@/modules/layout/model/networkNodeToElkNode';
import type { Network } from '@/modules/network/model/Network';
import Elk from 'elkjs/lib/elk.bundled.js';
import type { ElkNode } from 'elkjs';
import { useEffect, useState } from 'react';
import { ELK_LAYOUT_OPTIONS } from '@/modules/layout/view/layout.constants';

const elk = new Elk();

export type LayoutPositions = Map<number, { x: number; y: number }>;

export const useElkLayout = (network: Network) => {
  const [positions, setPositions] = useState<LayoutPositions | null>(null);

  useEffect(() => {
    let cancelled = false;

    const graph: ElkNode = {
      id: 'root',
      layoutOptions: ELK_LAYOUT_OPTIONS.STRESS,
      children: network.nodes.map(networkNodeToElkNode),
      edges: network.connections.map(networkConnectionToElkEdge),
    };

    elk.layout(graph)
      .then(({ children = [] }) => {
        if (cancelled) {
          return;
        }

        setPositions(new Map(
          children.map(({ id, x = 0, y = 0 }) => [Number(id), { x, y }]),
        ));
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.error('ELK layout failed', error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [network]);

  return positions;
};
