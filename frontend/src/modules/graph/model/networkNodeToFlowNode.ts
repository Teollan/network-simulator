import type { Node as FlowNode, XYPosition } from '@xyflow/react';
import { NODE_TYPE } from '@/components/editor/canvas/node/node.constants';
import type { Node } from '@/modules/network/Node';

export const networkNodeToFlowNode = (node: Node, position: XYPosition): FlowNode => ({
  id: node.id.toString(),
  type: NODE_TYPE.ROUTER,
  position,
  data: { label: node.label },
});
