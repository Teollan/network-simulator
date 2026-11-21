import type { LinkMedium } from '@/modules/network/Link';

export const NETWORK_BUILDER_ACTION = {
  SPAWN_REGION: 'spawn-region',
  LINK_INSIDE_REGION: 'link-inside-region',
  LINK_REGIONS: 'link-regions',
  ATTACH_WORKSTATIONS: 'attach-workstations',
  ASSIGN_LINK_WEIGHTS: 'assign-link-weights',
  ASSIGN_BIT_ERROR_RATE: 'assign-bit-error-rate',
  ASSIGN_LINK_TYPE: 'assign-link-type',
  ASSIGN_BUFFER_SIZE: 'assign-buffer-size',
} as const;

export type NetworkBuilderActionKind = typeof NETWORK_BUILDER_ACTION[keyof typeof NETWORK_BUILDER_ACTION];

export type NetworkBuilderAction =
  {
    kind: typeof NETWORK_BUILDER_ACTION.SPAWN_REGION;
    count: number;
    region: string
  }
  | {
    kind: typeof NETWORK_BUILDER_ACTION.LINK_INSIDE_REGION;
    degree: number;
    region: string
  }
  | {
    kind: typeof NETWORK_BUILDER_ACTION.LINK_REGIONS;
    sourceRegion: string;
    targetRegion: string
  }
  | {
    kind: typeof NETWORK_BUILDER_ACTION.ATTACH_WORKSTATIONS;
    every: number;
    region: string
  }
  | {
    kind: typeof NETWORK_BUILDER_ACTION.ASSIGN_LINK_WEIGHTS;
    pool: number[]
  }
  | {
    kind: typeof NETWORK_BUILDER_ACTION.ASSIGN_BIT_ERROR_RATE;
    value: number;
    medium?: LinkMedium
  }
  | {
    kind: typeof NETWORK_BUILDER_ACTION.ASSIGN_LINK_TYPE;
    halfDuplexShare: number;
    medium?: LinkMedium
  }
  | {
    kind: typeof NETWORK_BUILDER_ACTION.ASSIGN_BUFFER_SIZE;
    pool: number[];
    medium?: LinkMedium
  };

export type TopologyRecipeStepOf<K extends NetworkBuilderActionKind> = Extract<NetworkBuilderAction, { kind: K }>;

export interface NetworkRecipe {
  actions: NetworkBuilderAction[];
}
