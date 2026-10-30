import type { NetworkPacket } from '@/modules/network/model/NetworkPacket';

export interface NetworkFrame {
  packet: NetworkPacket;
  sourceId: number;
  destinationId: number;
}
