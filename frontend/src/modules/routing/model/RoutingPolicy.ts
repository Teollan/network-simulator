import type { Network } from '@/modules/network/model/Network';
import type { NetworkFrame } from '@/modules/network/model/NetworkFrame';
import type { NetworkNode } from '@/modules/network/model/NetworkNode';
import type { SimulationLinkState } from '@/modules/simulation/model/SimulationLinkState';
import type { SimulationNodeState } from '@/modules/simulation/model/SimulationNodeState';

export interface RoutingPolicyContext {
  readonly network: Network;
  readonly linkStatesByLinkId: ReadonlyMap<number, SimulationLinkState>;
};

export interface RoutingResult<T extends SimulationNodeState> {
  state: T,
  destinationIds: number[]
}

export interface RoutingPolicy<T extends SimulationNodeState> {
  initState(node: NetworkNode, ctx: RoutingPolicyContext): T;
  onPacket(state: T, frame: NetworkFrame, ctx: RoutingPolicyContext): RoutingResult<T>;
}
