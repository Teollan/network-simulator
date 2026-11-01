import type { Network } from '@/modules/network/model/Network';
import type { NetworkFrame } from '@/modules/network/model/NetworkFrame';
import type { NetworkNode } from '@/modules/network/model/NetworkNode';
import type { SimulationLinkState } from '@/modules/simulation/model/SimulationLinkState';

export interface RoutingPolicyContext {
  readonly network: Network;
  readonly linkStatesByLinkId: ReadonlyMap<number, SimulationLinkState>;
};

export interface RoutingResult<T> {
  state: T,
  destinationIds: number[]
}

export interface RoutingPolicy<T> {
  initState(node: NetworkNode, ctx: RoutingPolicyContext): T;
  onPacket(state: T, frame: NetworkFrame, ctx: RoutingPolicyContext): RoutingResult<T>;
}
