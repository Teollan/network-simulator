import type { NetworkFrame } from '@/modules/network/NetworkFrame';

export interface SimulationLinkState {
  queue: NetworkFrame[];
  isBusy: boolean;
}
