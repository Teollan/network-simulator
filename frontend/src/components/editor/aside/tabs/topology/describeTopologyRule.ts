import { TOPOLOGY_RULE_KIND_LABEL } from '@/components/editor/aside/tabs/topology/topologyRuleForm';
import type { LinkMedium } from '@/modules/network/Link';
import {
  TOPOLOGY_BUILDER_ACTION as ACTION,
  type TopologyBuilderAction,
} from '@/modules/network/builder/TopologySpec';

export interface TopologyRuleDetail {
  term: string;
  description: string;
}

const describeMedium = (medium?: LinkMedium) => (medium ? `${medium} links` : 'all links');

const describePool = (pool: number[]) => `{${pool.join(', ')}}`;

const formatShare = (share: number) => `${+(share * 100).toFixed(2)}%`;

export const summarizeTopologyRule = (action: TopologyBuilderAction): string => {
  switch (action.kind) {
    case ACTION.CREATE_REGION:
      return `Create ${action.options.label} · ${action.options.size} routers`;
    case ACTION.LINK_INSIDE_REGION:
      return `Link inside ${action.options.region} · degree ${action.options.degree}`;
    case ACTION.LINK_REGIONS:
      return `Link ${action.options.sourceRegion} ↔ ${action.options.targetRegion}`;
    case ACTION.ATTACH_WORKSTATIONS:
      return `Workstations in ${action.options.region} · every ${action.options.every}`;
    case ACTION.ASSIGN_LINK_WEIGHTS:
      return `Weights from ${describePool(action.options.pool)}`;
    case ACTION.ASSIGN_BIT_ERROR_RATE:
      return `BER ${action.options.value} · ${describeMedium(action.options.medium)}`;
    case ACTION.ASSIGN_LINK_TYPE:
      return `Half-duplex ${formatShare(action.options.halfDuplexShare)} · ${describeMedium(action.options.medium)}`;
    case ACTION.ASSIGN_BUFFER_SIZE:
      return `Buffers from ${describePool(action.options.pool)} · ${describeMedium(action.options.medium)}`;
  }
};

export const describeTopologyRule = (action: TopologyBuilderAction): TopologyRuleDetail[] => {
  const rule = {
    term: 'Rule',
    description: TOPOLOGY_RULE_KIND_LABEL[action.kind],
  };

  switch (action.kind) {
    case ACTION.CREATE_REGION:
      return [rule, {
        term: 'Label',
        description: action.options.label,
      }, {
        term: 'Routers',
        description: `${action.options.size}`,
      }];
    case ACTION.LINK_INSIDE_REGION:
      return [rule, {
        term: 'Region',
        description: action.options.region,
      }, {
        term: 'Degree',
        description: `${action.options.degree} on average, over a random spanning tree`,
      }];
    case ACTION.LINK_REGIONS:
      return [rule, {
        term: 'Regions',
        description: `${action.options.sourceRegion} and ${action.options.targetRegion}`,
      }, {
        term: 'Link',
        description: 'One satellite link between random routers',
      }];
    case ACTION.ATTACH_WORKSTATIONS:
      return [rule, {
        term: 'Region',
        description: action.options.region,
      }, {
        term: 'Every',
        description: `One workstation per ${action.options.every} routers`,
      }];
    case ACTION.ASSIGN_LINK_WEIGHTS:
      return [rule, {
        term: 'Pool',
        description: `${describePool(action.options.pool)}, picked per link`,
      }];
    case ACTION.ASSIGN_BIT_ERROR_RATE:
      return [rule, {
        term: 'Value',
        description: `${action.options.value}`,
      }, {
        term: 'Applies to',
        description: describeMedium(action.options.medium),
      }];
    case ACTION.ASSIGN_LINK_TYPE:
      return [rule, {
        term: 'Half-duplex',
        description: `${formatShare(action.options.halfDuplexShare)} of the links, the rest full-duplex`,
      }, {
        term: 'Applies to',
        description: describeMedium(action.options.medium),
      }];
    case ACTION.ASSIGN_BUFFER_SIZE:
      return [rule, {
        term: 'Pool',
        description: `${describePool(action.options.pool)}, picked per link, both ends`,
      }, {
        term: 'Applies to',
        description: describeMedium(action.options.medium),
      }];
  }
};
