import type { Node as FlowNode, XYPosition } from '@xyflow/react';
import { NODE_TYPE as FLOW_NODE_TYPE } from '@/components/editor/canvas/node/node.constants';
import { NODE_TYPE, type Node } from '@/modules/network/Node';

const FLOW_NODE_TYPE_BY_NODE_TYPE = {
  [NODE_TYPE.ROUTER]: FLOW_NODE_TYPE.ROUTER,
  [NODE_TYPE.WORKSTATION]: FLOW_NODE_TYPE.WORKSTATION,
};

export const networkNodeToFlowNode = (node: Node, position: XYPosition): FlowNode => ({
  id: node.id.toString(),
  type: FLOW_NODE_TYPE_BY_NODE_TYPE[node.type],
  position,
  data: { label: node.label },
});
