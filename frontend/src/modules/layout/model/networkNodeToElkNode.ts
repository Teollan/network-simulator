import type { NetworkNode } from '@/modules/network/model/NetworkNode';
import type { ElkNode } from 'elkjs';

export const networkNodeToElkNode = (node: NetworkNode): ElkNode => ({
  id: node.id.toString(),
  width: 100,
  height: 100,
});
