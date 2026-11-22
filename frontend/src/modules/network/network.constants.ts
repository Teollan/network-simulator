import {
  TOPOLOGY_BUILDER_ACTION as ACTION,
  type TopologySpec,
} from '@/modules/network/builder/TopologySpec';

export const DEFAULT_WEIGHT_POOL = [3, 5, 7, 8, 11, 12, 15, 18, 21, 25];
export const DEFAULT_ROUTERS_PER_REGION = 9;
export const DEFAULT_CONNECTIVITY_DEGREE = 3.5;
export const DEFAULT_WORKSTATION_INTERVAL = 3;
export const DEFAULT_HALF_DUPLEX_SHARE = 0.25;

export const DEFAULT_TOPOLOGY_SPEC: TopologySpec = {
  actions: [
    {
      kind: ACTION.CREATE_REGION,
      options: {
        label: 'US',
        size: DEFAULT_ROUTERS_PER_REGION,
      },
    },
    {
      kind: ACTION.LINK_INSIDE_REGION,
      options: {
        degree: DEFAULT_CONNECTIVITY_DEGREE,
        region: 'US',
      },
    },
    {
      kind: ACTION.CREATE_REGION,
      options: {
        label: 'DE',
        size: DEFAULT_ROUTERS_PER_REGION,
      },
    },
    {
      kind: ACTION.LINK_INSIDE_REGION,
      options: {
        degree: DEFAULT_CONNECTIVITY_DEGREE,
        region: 'DE',
      },
    },
    {
      kind: ACTION.CREATE_REGION,
      options: {
        label: 'UA',
        size: DEFAULT_ROUTERS_PER_REGION,
      },
    },
    {
      kind: ACTION.LINK_INSIDE_REGION,
      options: {
        degree: DEFAULT_CONNECTIVITY_DEGREE,
        region: 'UA',
      },
    },
    {
      kind: ACTION.LINK_REGIONS,
      options: {
        sourceRegion: 'US',
        targetRegion: 'DE',
      },
    },
    {
      kind: ACTION.LINK_REGIONS,
      options: {
        sourceRegion: 'DE',
        targetRegion: 'UA',
      },
    },
    {
      kind: ACTION.LINK_REGIONS,
      options: {
        sourceRegion: 'UA',
        targetRegion: 'US',
      },
    },
    {
      kind: ACTION.ATTACH_WORKSTATIONS,
      options: {
        every: DEFAULT_WORKSTATION_INTERVAL,
        region: 'US',
      },
    },
    {
      kind: ACTION.ATTACH_WORKSTATIONS,
      options: {
        every: DEFAULT_WORKSTATION_INTERVAL,
        region: 'DE',
      },
    },
    {
      kind: ACTION.ATTACH_WORKSTATIONS,
      options: {
        every: DEFAULT_WORKSTATION_INTERVAL,
        region: 'UA',
      },
    },
    {
      kind: ACTION.ASSIGN_LINK_WEIGHTS,
      options: {
        pool: DEFAULT_WEIGHT_POOL,
      },
    },
    {
      kind: ACTION.ASSIGN_LINK_TYPE,
      options: {
        halfDuplexShare: DEFAULT_HALF_DUPLEX_SHARE,
      },
    },
    // TODO: add proper default BERs
    {
      kind: ACTION.ASSIGN_BIT_ERROR_RATE,
      options: {
        value: 0,
      },
    },
  ],
};
