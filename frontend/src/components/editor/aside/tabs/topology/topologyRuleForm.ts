import type { LinkMedium } from '@/modules/network/Link';
import {
  TOPOLOGY_BUILDER_ACTION as ACTION,
  type TopologyBuilderAction,
  type TopologyBuilderActionKind,
} from '@/modules/network/builder/TopologySpec';
import {
  DEFAULT_CONNECTIVITY_DEGREE,
  DEFAULT_HALF_DUPLEX_SHARE,
  DEFAULT_ROUTERS_PER_REGION,
  DEFAULT_WORKSTATION_INTERVAL,
} from '@/modules/network/network.constants';

export const ALL_MEDIA = 'all';

export interface TopologyRuleFormValues {
  kind: TopologyBuilderActionKind;
  options: {
    label: string;
    size: number;
    region: string;
    degree: number;
    sourceRegion: string;
    targetRegion: string;
    every: number;
    pool: string;
    value: number;
    halfDuplexShare: number;
    medium: LinkMedium | typeof ALL_MEDIA;
  };
}

export const TOPOLOGY_RULE_KIND_LABEL: Record<TopologyBuilderActionKind, string> = {
  [ACTION.CREATE_REGION]: 'Create region',
  [ACTION.LINK_INSIDE_REGION]: 'Link inside region',
  [ACTION.LINK_REGIONS]: 'Link regions',
  [ACTION.ATTACH_WORKSTATIONS]: 'Attach workstations',
  [ACTION.ASSIGN_LINK_WEIGHTS]: 'Assign link weights',
  [ACTION.ASSIGN_BIT_ERROR_RATE]: 'Assign bit error rate',
  [ACTION.ASSIGN_LINK_TYPE]: 'Assign link type',
  [ACTION.ASSIGN_BUFFER_SIZE]: 'Assign buffer size',
};

export const makeDefaultFormValues = (regions: string[]): TopologyRuleFormValues => ({
  kind: ACTION.CREATE_REGION,
  options: {
    label: '',
    size: DEFAULT_ROUTERS_PER_REGION,
    region: regions.at(0) ?? '',
    degree: DEFAULT_CONNECTIVITY_DEGREE,
    sourceRegion: regions.at(0) ?? '',
    targetRegion: regions.at(1) ?? '',
    every: DEFAULT_WORKSTATION_INTERVAL,
    pool: '',
    value: 0,
    halfDuplexShare: DEFAULT_HALF_DUPLEX_SHARE,
    medium: ALL_MEDIA,
  },
});

const formatPool = (pool: number[]) => pool.join(', ');

const parsePool = (pool: string): number[] => pool.split(/[\s,]+/).filter(Boolean).map(Number);

export const toFormValues = (action: TopologyBuilderAction, regions: string[]): TopologyRuleFormValues => {
  const defaults = makeDefaultFormValues(regions);
  const options: Partial<TopologyRuleFormValues['options']> = {
    ...action.options,
    pool: 'pool' in action.options ? formatPool(action.options.pool) : defaults.options.pool,
    medium: 'medium' in action.options ? action.options.medium ?? ALL_MEDIA : defaults.options.medium,
  };

  return {
    kind: action.kind,
    options: {
      ...defaults.options,
      ...options,
    },
  };
};

export const toAction = ({
  kind,
  options,
}: TopologyRuleFormValues): TopologyBuilderAction => {
  const medium = options.medium === ALL_MEDIA ? {} : { medium: options.medium };

  switch (kind) {
    case ACTION.CREATE_REGION:
      return {
        kind,
        options: {
          label: options.label,
          size: options.size,
        },
      };
    case ACTION.LINK_INSIDE_REGION:
      return {
        kind,
        options: {
          region: options.region,
          degree: options.degree,
        },
      };
    case ACTION.LINK_REGIONS:
      return {
        kind,
        options: {
          sourceRegion: options.sourceRegion,
          targetRegion: options.targetRegion,
        },
      };
    case ACTION.ATTACH_WORKSTATIONS:
      return {
        kind,
        options: {
          region: options.region,
          every: options.every,
        },
      };
    case ACTION.ASSIGN_LINK_WEIGHTS:
      return {
        kind,
        options: { pool: parsePool(options.pool) },
      };
    case ACTION.ASSIGN_BIT_ERROR_RATE:
      return {
        kind,
        options: {
          value: options.value,
          ...medium,
        },
      };
    case ACTION.ASSIGN_LINK_TYPE:
      return {
        kind,
        options: {
          halfDuplexShare: options.halfDuplexShare,
          ...medium,
        },
      };
    case ACTION.ASSIGN_BUFFER_SIZE:
      return {
        kind,
        options: {
          pool: parsePool(options.pool),
          ...medium,
        },
      };
  }
};
