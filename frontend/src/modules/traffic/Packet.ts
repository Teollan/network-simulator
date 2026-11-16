import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';
import type { Message } from '@/modules/traffic/Message';

export interface Packet {
  id: number;

  message: Message;
  source: StatefulNode;
  destination: StatefulNode;

  offset: number;
  length: number;
  isLast: boolean;

  hopLimit: number;
  cost: number;
}

export function byOffset(a: Packet, b: Packet) {
  return a.offset - b.offset;
}
