import type { Node } from '@/modules/network/node/Node';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';

export function isWorkstation(node: Node) {
  return node.type === NODE_TYPE.WORKSTATION;
}
