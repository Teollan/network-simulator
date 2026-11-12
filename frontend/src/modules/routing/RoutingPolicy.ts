import type { Network } from '@/modules/network/Network';
import type { Frame } from '@/modules/traffic/Frame';
import type { SimulationLinkState } from '@/modules/simulation/SimulationLinkState';
import type { Node } from '@/modules/network/Node';

export interface RoutingPolicyContext {
  readonly network: Network;
  readonly linkStatesByLinkId: ReadonlyMap<number, SimulationLinkState>;
};

export interface RoutingResult<T> {
  state: T,
  destinationIds: number[]
}

export interface RoutingPolicy<T> {
  initState(node: Node, ctx: RoutingPolicyContext): T;
  onPacket(state: T, frame: Frame, ctx: RoutingPolicyContext): RoutingResult<T>;
}
