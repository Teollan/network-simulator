import { RouterNode } from '@/components/editor/canvas/node/RouterNode';
import { WorkstationNode } from '@/components/editor/canvas/node/WorkstationNode';

export const NODE_TYPE = {
  ROUTER: 'router',
  WORKSTATION: 'workstation',
} as const;

export const NODE_TYPES = {
  [NODE_TYPE.ROUTER]: RouterNode,
  [NODE_TYPE.WORKSTATION]: WorkstationNode,
};

export const NODE_SIZE = 64; // px
