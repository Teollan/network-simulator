import type { Node as FlowNode, XYPosition } from '@xyflow/react';
import type { NetworkNode } from '@/modules/network/model/NetworkNode';
import { NODE_TYPE } from '@/modules/graph/view/graph.constants';

export const networkNodeToFlowNode = (node: NetworkNode, position: XYPosition): FlowNode => ({
  id: node.id.toString(),
  type: NODE_TYPE.ROUTER,
  position,
  data: { label: node.label },
});
