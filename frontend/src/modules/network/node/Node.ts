import type { BufferSize, NodeType } from '@/modules/network/node/Node.typedefs';

export interface Node {
  id: number;
  label: string;
  type: NodeType;
  regionId: number;
  bufferSize: BufferSize;
}
