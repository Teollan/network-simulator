import type { NetworkConfig } from '@/modules/network/generateNetwork';

export const VARIANT_WEIGHT_POOL = [3, 5, 7, 8, 11, 12, 15, 18, 21, 25];

export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  routersPerRegion: 9,
  averageDegree: 3.5,
  weightPool: VARIANT_WEIGHT_POOL,
};
