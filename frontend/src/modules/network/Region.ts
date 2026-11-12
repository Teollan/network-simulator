export interface Region {
  id: number;
  label: string;
}

export type CreateRegionFields = Pick<Region, 'label'>;
