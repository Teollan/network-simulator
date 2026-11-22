import type { LinkMedium } from '@/modules/network/Link';

export const TOPOLOGY_BUILDER_ACTION = {
  CREATE_REGION: 'create-region',
  LINK_INSIDE_REGION: 'link-inside-region',
  LINK_REGIONS: 'link-regions',
  ATTACH_WORKSTATIONS: 'attach-workstations',
  ASSIGN_LINK_WEIGHTS: 'assign-link-weights',
  ASSIGN_BIT_ERROR_RATE: 'assign-bit-error-rate',
  ASSIGN_LINK_TYPE: 'assign-link-type',
  ASSIGN_BUFFER_SIZE: 'assign-buffer-size',
} as const;

export type TopologyBuilderActionKind = typeof TOPOLOGY_BUILDER_ACTION[keyof typeof TOPOLOGY_BUILDER_ACTION];

interface Action<K, T> {
  kind: K;
  options: T;
}

export type TopologyBuilderAction =
  | Action<typeof TOPOLOGY_BUILDER_ACTION.CREATE_REGION, {
    label: string;
    size: number;
  }>
  | Action<typeof TOPOLOGY_BUILDER_ACTION.LINK_INSIDE_REGION, {
    degree: number;
    region: string;
  }>
  | Action<typeof TOPOLOGY_BUILDER_ACTION.LINK_REGIONS, {
    sourceRegion: string;
    targetRegion: string;
  }>
  | Action<typeof TOPOLOGY_BUILDER_ACTION.ATTACH_WORKSTATIONS, {
    every: number;
    region: string;
  }>
  | Action<typeof TOPOLOGY_BUILDER_ACTION.ASSIGN_LINK_WEIGHTS, {
    pool: number[];
  }>
  | Action<typeof TOPOLOGY_BUILDER_ACTION.ASSIGN_BIT_ERROR_RATE, {
    value: number;
    medium?: LinkMedium;
  }>
  | Action<typeof TOPOLOGY_BUILDER_ACTION.ASSIGN_LINK_TYPE, {
    halfDuplexShare: number;
    medium?: LinkMedium;
  }>
  | Action<typeof TOPOLOGY_BUILDER_ACTION.ASSIGN_BUFFER_SIZE, {
    pool: number[];
    medium?: LinkMedium;
  }>;

export type TopologyBuilderActionOptions<K extends TopologyBuilderActionKind> = Extract<TopologyBuilderAction, { kind: K }>['options'];

export interface TopologySpec {
  seed?: number;
  actions: TopologyBuilderAction[];
}
