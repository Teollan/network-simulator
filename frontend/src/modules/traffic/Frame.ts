import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';
import type { Packet } from '@/modules/traffic/Packet';

export interface Frame {
  packet: Packet;
  source: StatefulNode;
  destination: StatefulNode;
}
