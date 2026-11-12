export const LINK_TYPE = {
  DUPLEX: 'duplex',
  HALF_DUPLEX: 'half-duplex',
} as const;

export type LinkType = typeof LINK_TYPE[keyof typeof LINK_TYPE];

export const LINK_MEDIUM = {
  GROUND: 'ground',
  SATELLITE: 'satellite',
} as const;

export type LinkMedium = typeof LINK_MEDIUM[keyof typeof LINK_MEDIUM];

export interface Link {
  id: number;

  sourceId: number;
  targetId: number;

  type: LinkType;
  medium: LinkMedium;
  weight: number;
  bitErrorRate: number;
}

export const DEFAULT_LINK_FIELDS = {
  type: LINK_TYPE.DUPLEX,
  medium: LINK_MEDIUM.GROUND,
  weight: 1,
  bitErrorRate: 0,
};

export type CreateLinkFields = Pick<Link, 'sourceId' | 'targetId'>
  & Partial<Pick<Link, 'type' | 'medium' | 'weight' | 'bitErrorRate'>>

export type UpdateLinkFields = Pick<Link, 'id'>
  & Partial<Pick<Link, 'sourceId' | 'targetId' | 'type' | 'medium' | 'weight' | 'bitErrorRate'>>;

export type LinkFilters = Partial<Pick<Link, 'medium'>>
