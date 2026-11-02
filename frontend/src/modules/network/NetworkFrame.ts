import type { NetworkPacket } from '@/modules/network/NetworkPacket';

export interface NetworkFrame {
  packet: NetworkPacket;
  sourceId: number;
  destinationId: number;
}
