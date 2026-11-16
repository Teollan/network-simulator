export const NODE_TYPE = {
  ROUTER: 'router',
  WORKSTATION: 'workstation',
} as const;

export type NodeType = typeof NODE_TYPE[keyof typeof NODE_TYPE];

export interface Node {
  id: number;
  label: string;
  regionId: number;
  type: NodeType;
}

export const DEFAULT_NODE_FIELDS = {
  type: NODE_TYPE.ROUTER,
};

export type CreateNodeFields = Pick<Node, 'label' | 'regionId'>
  & Partial<Pick<Node, 'type'>>;

export type NodeFilters = Partial<Pick<Node, 'type'>>;
