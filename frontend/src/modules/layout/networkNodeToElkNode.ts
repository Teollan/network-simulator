import type { NetworkNode } from '@/modules/network/NetworkNode';
import type { ElkNode } from 'elkjs';
import { NODE_SIZE } from '@/components/editor/canvas/node/node.constants';

export const networkNodeToElkNode = (node: NetworkNode): ElkNode => ({
  id: node.id.toString(),
  width: NODE_SIZE,
  height: NODE_SIZE,
});
