import { RouterNode } from '@/components/editor/canvas/node/RouterNode';

export const NODE_TYPE = {
  ROUTER: 'router',
} as const;

export const NODE_TYPES = {
  [NODE_TYPE.ROUTER]: RouterNode,
};

export const NODE_SIZE = 48; // px
