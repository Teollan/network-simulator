import type { Node } from '@/modules/network/Node';
import type { NodeBuffers } from '@/modules/simulation/state/NodeBuffers';

export interface StatefulNode extends Node {
  buffers: NodeBuffers;
}
