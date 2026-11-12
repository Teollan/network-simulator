import { NETWORK_BUILDER_ACTION as ACTION, type NetworkRecipe } from '@/modules/network/builder/NetworkRecipe';

export const DEFAULT_WEIGHT_POOL = [3, 5, 7, 8, 11, 12, 15, 18, 21, 25];
export const DEFAULT_ROUTERS_PER_REGION = 9;
export const DEFAULT_CONNECTIVITY_DEGREE = 3.5;

export const DEFAULT_NETWORK_RECIPE: NetworkRecipe = {
  actions: [
    {
      kind: ACTION.SPAWN_REGION,
      count: DEFAULT_ROUTERS_PER_REGION,
      region: 'US',
    },
    {
      kind: ACTION.LINK_INSIDE_REGION,
      degree: DEFAULT_CONNECTIVITY_DEGREE,
      region: 'US',
    },
    {
      kind: ACTION.SPAWN_REGION,
      count: DEFAULT_ROUTERS_PER_REGION,
      region: 'DE',
    },
    {
      kind: ACTION.LINK_INSIDE_REGION,
      degree: DEFAULT_CONNECTIVITY_DEGREE,
      region: 'DE',
    },
    {
      kind: ACTION.SPAWN_REGION,
      count: DEFAULT_ROUTERS_PER_REGION,
      region: 'UA',
    },
    {
      kind: ACTION.LINK_INSIDE_REGION,
      degree: DEFAULT_CONNECTIVITY_DEGREE,
      region: 'UA',
    },
    {
      kind: ACTION.LINK_REGIONS,
      sourceRegion: 'US',
      targetRegion: 'DE',
    },
    {
      kind: ACTION.LINK_REGIONS,
      sourceRegion: 'DE',
      targetRegion: 'UA',
    },
    {
      kind: ACTION.LINK_REGIONS,
      sourceRegion: 'UA',
      targetRegion: 'US',
    },
    {
      kind: ACTION.ASSIGN_LINK_WEIGHTS,
      pool: DEFAULT_WEIGHT_POOL,
    },
    // TODO: add proper default BERs
    {
      kind: ACTION.ASSIGN_BIT_ERROR_RATE,
      value: 0,
    },
  ],
};
