import type { Node } from '@/modules/network/node/Node';
import type { NODE_TYPE } from '@/modules/network/node/Node.constants';

export type NodeType = typeof NODE_TYPE[keyof typeof NODE_TYPE];

export interface BufferSize {
  default: number,
  overrides?: Record<number, number> | null;
}

export type CreateNodeFields = Pick<Node, 'label' | 'regionId'>
  & Partial<Pick<Node, 'type' | 'bufferSize'>>;

export type UpdateNodeFields = Pick<Node, 'id'>
  & Partial<Pick<Node, 'label' | 'type' | 'regionId' | 'bufferSize'>>;

export type NodeFilters = Partial<Pick<Node, 'type'>>;
