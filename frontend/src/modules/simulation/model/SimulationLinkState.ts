import type { NetworkFrame } from '@/modules/network/model/NetworkFrame';

export interface SimulationLinkState {
  queue: NetworkFrame[];
  isBusy: boolean;
}
