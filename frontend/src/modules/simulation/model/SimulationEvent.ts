import type { NetworkFrame } from '@/modules/network/model/NetworkFrame';
import type { NetworkMessage } from '@/modules/network/model/NetworkMessage';
import type { NetworkPacket } from '@/modules/network/model/NetworkPacket';

export const SIMULATION_EVENT_KIND = {
  MESSAGE_SENT: 'message::sent',
  MESSAGE_RECEIVED: 'message::received',

  PACKET_CREATED: 'packet::created',
  PACKET_ENQUEUED: 'packet::enqueued',
  PACKET_SENT: 'packet::sent',
  PACKET_RECEIVED: 'packet::received',
  PACKET_DROPPED: 'packet::dropped',
} as const;

export type SimulationEventKind = typeof SIMULATION_EVENT_KIND[keyof typeof SIMULATION_EVENT_KIND];

export const PACKET_DROP_REASON = {
  HOP_LIMIT: 'hop-limit',
  NO_ROUTE: 'no-route',
} as const;

export type PacketDropReason = typeof PACKET_DROP_REASON[keyof typeof PACKET_DROP_REASON];

export type SimulationEventData<K extends SimulationEventKind> = {
  [SIMULATION_EVENT_KIND.MESSAGE_SENT]: {
    fromNodeId: number;
    toNodeId: number;
    message: NetworkMessage;
  };
  [SIMULATION_EVENT_KIND.MESSAGE_RECEIVED]: {
    nodeId: number;
    message: NetworkMessage;
  };
  [SIMULATION_EVENT_KIND.PACKET_CREATED]: {
    packet: NetworkPacket;
  };
  [SIMULATION_EVENT_KIND.PACKET_ENQUEUED]: {
    frame: NetworkFrame;
  };
  [SIMULATION_EVENT_KIND.PACKET_SENT]: {
    frame: NetworkFrame;
  };
  [SIMULATION_EVENT_KIND.PACKET_RECEIVED]: {
    frame: NetworkFrame;
  };
  [SIMULATION_EVENT_KIND.PACKET_DROPPED]: {
    packet: NetworkPacket;
    nodeId: number;
    reason: PacketDropReason;
  };
}[K];

export type SimulationEvent<K extends SimulationEventKind = SimulationEventKind> = {
  [P in K]: {
    kind: P;
    data: SimulationEventData<P>;
    time: number;
  };
}[K];
