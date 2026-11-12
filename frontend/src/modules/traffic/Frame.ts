import type { Packet } from '@/modules/traffic/Packet';

export interface Frame {
  packet: Packet;
  sourceId: number;
  destinationId: number;
}
