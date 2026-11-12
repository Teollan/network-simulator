import type { Frame } from '@/modules/traffic/Frame';

export interface SimulationLinkState {
  queue: Frame[];
  isBusy: boolean;
}
