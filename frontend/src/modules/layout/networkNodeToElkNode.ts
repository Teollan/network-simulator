import type { ElkNode } from 'elkjs';
import type { Node } from '@/modules/network/node/Node';
import { NODE_SIZE } from '@/components/editor/canvas/node/node.constants';

export const networkNodeToElkNode = (node: Node): ElkNode => ({
  id: node.id.toString(),
  width: NODE_SIZE,
  height: NODE_SIZE,
});
