import type { Frame } from '@/modules/traffic/Frame';
import type { Message } from '@/modules/traffic/Message';
import type { Packet } from '@/modules/traffic/Packet';
import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';

export const SIMULATION_EVENT_KIND = {
  MESSAGE_SENT: 'message::sent',
  MESSAGE_RECEIVED: 'message::received',

  PACKET_SENT: 'packet::sent',
  PACKET_RECEIVED: 'packet::received',
  PACKET_DROPPED: 'packet::dropped',

  FRAME_FORWARDED: 'frame::forwarded',
  FRAME_SENT: 'frame::sent',
  FRAME_RECEIVED: 'frame::received',
} as const;

export type SimulationEventKind = typeof SIMULATION_EVENT_KIND[keyof typeof SIMULATION_EVENT_KIND];

export const PACKET_DROP_REASON = {
  HOP_LIMIT: 'hop-limit',
  NO_ROUTE: 'no-route',
} as const;

export type PacketDropReason = typeof PACKET_DROP_REASON[keyof typeof PACKET_DROP_REASON];

export type SimulationEventData<K extends SimulationEventKind> = {
  [SIMULATION_EVENT_KIND.MESSAGE_SENT]: {
    source: StatefulNode;
    destination: StatefulNode;
    message: Message;
  };
  [SIMULATION_EVENT_KIND.MESSAGE_RECEIVED]: {
    thisNode: StatefulNode;
    message: Message;
  };

  [SIMULATION_EVENT_KIND.PACKET_SENT]: {
    from: StatefulNode | null;
    thisNode: StatefulNode;
    packet: Packet;
  };
  [SIMULATION_EVENT_KIND.PACKET_DROPPED]: {
    packet: Packet;
    thisNode: StatefulNode;
    reason: PacketDropReason;
  };
  [SIMULATION_EVENT_KIND.PACKET_RECEIVED]: {
    from: StatefulNode | null;
    thisNode: StatefulNode;
    packet: Packet;
  };

  [SIMULATION_EVENT_KIND.FRAME_FORWARDED]: {
    frame: Frame;
  };
  [SIMULATION_EVENT_KIND.FRAME_SENT]: {
    frame: Frame;
  };
  [SIMULATION_EVENT_KIND.FRAME_RECEIVED]: {
    frame: Frame;
  };
}[K];

export type SimulationEvent<K extends SimulationEventKind = SimulationEventKind> = {
  [P in K]: {
    kind: P;
    data: SimulationEventData<P>;
    time: number;
    serial: number;
  };
}[K];

export type RelativeSimulationEvent<K extends SimulationEventKind = SimulationEventKind> = {
  [P in K]: {
    kind: P;
    data: SimulationEventData<P>;
    eta: number;
  };
}[K];

export const byTimeAndSerial = (a: SimulationEvent, b: SimulationEvent) => (
  a.time < b.time || (a.time === b.time && a.serial < b.serial)
);
