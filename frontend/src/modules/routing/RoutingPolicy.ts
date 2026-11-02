import type { Network } from '@/modules/network/Network';
import type { NetworkFrame } from '@/modules/network/NetworkFrame';
import type { NetworkNode } from '@/modules/network/NetworkNode';
import type { SimulationLinkState } from '@/modules/simulation/SimulationLinkState';

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
