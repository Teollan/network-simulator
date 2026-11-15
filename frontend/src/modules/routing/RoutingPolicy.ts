import type { Frame } from '@/modules/traffic/Frame';
import type { Node } from '@/modules/network/Node';
import type { StatefulNetwork } from '@/modules/simulation/state/StatefulNetwork';

export interface RoutingPolicyContext {
  readonly network: StatefulNetwork;
};

export interface RoutingPolicy<T> {
  initState(node: Node, ctx: RoutingPolicyContext): T;
  onPacket(frame: Frame, ctx: RoutingPolicyContext): number[];
}
