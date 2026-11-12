export interface Node {
  id: number;
  label: string;
  regionId: number;
}

export type CreateNodeFields = Pick<Node, 'label' | 'regionId'>;
