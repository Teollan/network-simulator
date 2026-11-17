import type { Edge } from '@xyflow/react';

export interface EdgePacket {
  id: number;
  // INFO: 0 to 1 from the edge source to the edge target, already flipped for reverse frames
  progress: number;
}

// INFO: React Flow requires edge data to be a Record<string, unknown>,
// which only a type alias satisfies, interfaces have no implicit index signature
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type FloatingEdgeData = {
  packets?: EdgePacket[];
};

export type FloatingEdgeType = Edge<FloatingEdgeData>;
