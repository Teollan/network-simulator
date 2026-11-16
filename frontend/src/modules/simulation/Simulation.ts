import type { Network } from '@/modules/network/Network';
import type { RoutingPolicy } from '@/modules/routing/RoutingPolicy';
import {
  byTimeAndSerial,
  SIMULATION_EVENT_KIND,
  type RelativeSimulationEvent,
  type SimulationEvent,
  type SimulationEventKind,
} from '@/modules/simulation/events/SimulationEvent';
import { PriorityQueue } from '@/modules/util/PriorityQueue/PriorityQueue';
import { StatefulNetwork } from '@/modules/simulation/state/StatefulNetwork';
import { handleMessageSent } from '@/modules/simulation/events/handlers/handleMessageSent';
import { handleMessageReceived } from '@/modules/simulation/events/handlers/handleMessageReceived';
import { handlePacketSent } from '@/modules/simulation/events/handlers/handlePacketSent';
import { handlePacketReceived } from '@/modules/simulation/events/handlers/handlePacketReceived';
import { handlePacketDropped } from '@/modules/simulation/events/handlers/handlePacketDropped';
import { handleFrameForwarded } from '@/modules/simulation/events/handlers/handleFrameForwarded';
import { handleFrameSent } from '@/modules/simulation/events/handlers/handleFrameSent';
import { handleFrameReceived } from '@/modules/simulation/events/handlers/handleFrameReceived';
import { Serial } from '@/modules/util/Serial';
import type { SimulationEventHandler } from '@/modules/simulation/events/handlers/handlers.typedef';
import { PacketFactory } from '@/modules/traffic/PacketFactory';
import type { Message } from '@/modules/traffic/Message';

const MAX_PACKET_LENGTH = 10;
const MAX_HOPS = 10;

interface TrafficDTO {
  message: Message;
  sourceId: number;
  destinationId: number;
  time: number;
}

export interface SimulationConfig {
  network: Network;
  routingPolicy: RoutingPolicy;
  traffic: TrafficDTO[];
}

export class Simulation {
  private eventsSerial = new Serial();
  private events = new PriorityQueue<SimulationEvent>(byTimeAndSerial);

  readonly trace: SimulationEvent[] = [];
  private clock = 0;

  readonly network: StatefulNetwork;
  readonly routing: RoutingPolicy;
  readonly packets: PacketFactory;

  private handlersByEventKind: { [K in SimulationEventKind]: SimulationEventHandler<K>[] } = {
    [SIMULATION_EVENT_KIND.MESSAGE_SENT]: [handleMessageSent],
    [SIMULATION_EVENT_KIND.MESSAGE_RECEIVED]: [handleMessageReceived],

    [SIMULATION_EVENT_KIND.PACKET_SENT]: [handlePacketSent],
    [SIMULATION_EVENT_KIND.PACKET_RECEIVED]: [handlePacketReceived],
    [SIMULATION_EVENT_KIND.PACKET_DROPPED]: [handlePacketDropped],

    [SIMULATION_EVENT_KIND.FRAME_FORWARDED]: [handleFrameForwarded],
    [SIMULATION_EVENT_KIND.FRAME_SENT]: [handleFrameSent],
    [SIMULATION_EVENT_KIND.FRAME_RECEIVED]: [handleFrameReceived],
  };

  constructor(config: SimulationConfig) {
    this.network = new StatefulNetwork(config.network);
    this.routing = config.routingPolicy;

    this.packets = new PacketFactory({
      maxSize: MAX_PACKET_LENGTH,
      maxHops: MAX_HOPS,
    });

    for (const item of config.traffic) {
      this.schedule({
        kind: SIMULATION_EVENT_KIND.MESSAGE_SENT,
        data: {
          message: item.message,
          source: this.network.getWorkstation(item.sourceId),
          destination: this.network.getWorkstation(item.destinationId),
        },
        eta: item.time,
      });
    }
  }

  get pendingEventCount() {
    return this.events.length;
  }

  get time() {
    return this.clock;
  }

  run(until = Infinity) {
    while (this.events.length > 0) {
      const event = this.events.peek();

      if (!event || event.time > until) {
        break;
      }

      this.events.pop();
      this.clock = event.time;

      this.trace.push(event);

      const handlers = this.handlersByEventKind[event.kind] as SimulationEventHandler<typeof event.kind>[];

      try {
        for (const handler of handlers) {
          handler(event, this);
        }
      } catch (e) {
        console.error(e);

        break;
      }
    }
  }

  schedule(data: RelativeSimulationEvent | RelativeSimulationEvent[]): void {
    const events = Array.isArray(data) ? data : [data];

    for (const { eta, ...event } of events) {
      if (eta < 0) {
        throw Error(`Event ${event.kind} scheduled with ${this.clock + eta}, before the clock at ${this.clock}!`);
      }

      this.events.push(({
        ...event,
        time: this.clock + eta,
        serial: this.eventsSerial.next(),
      }));
    }
  }
}
