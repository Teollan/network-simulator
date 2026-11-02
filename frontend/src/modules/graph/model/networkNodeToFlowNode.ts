import type { Node as FlowNode, XYPosition } from '@xyflow/react';
import type { NetworkNode } from '@/modules/network/NetworkNode';
import { NODE_TYPE } from '@/components/editor/canvas/node/node.constants';

export const networkNodeToFlowNode = (node: NetworkNode, position: XYPosition): FlowNode => ({
  id: node.id.toString(),
  type: NODE_TYPE.ROUTER,
  position,
  data: { label: node.label },
});
