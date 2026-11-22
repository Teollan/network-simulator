import type { Simulation } from '@/modules/simulation/Simulation';
import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';

export interface RoutingOptions {
  thisNode: StatefulNode;
  source: StatefulNode | null;
  destination: StatefulNode;
}

export interface RoutingPolicy {
  route(options: RoutingOptions, simulation: Simulation): StatefulNode[];
}
