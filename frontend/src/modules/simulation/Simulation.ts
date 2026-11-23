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
import { pollTrafficGenerator } from '@/modules/simulation/events/handlers/pollTrafficGenerator';
import { handleMessageReceived } from '@/modules/simulation/events/handlers/handleMessageReceived';
import { handlePacketSent } from '@/modules/simulation/events/handlers/handlePacketSent';
import { handlePacketReceived } from '@/modules/simulation/events/handlers/handlePacketReceived';
import { handlePacketDropped } from '@/modules/simulation/events/handlers/handlePacketDropped';
import { handleFrameForwarded } from '@/modules/simulation/events/handlers/handleFrameForwarded';
import { handleFrameSent } from '@/modules/simulation/events/handlers/handleFrameSent';
import { handleFrameReceived } from '@/modules/simulation/events/handlers/handleFrameReceived';
import { handleLinkAcquired } from '@/modules/simulation/events/handlers/handleLinkAcquired';
import { handleLinkReleased } from '@/modules/simulation/events/handlers/handleLinkReleased';
import { Serial } from '@/modules/util/Serial';
import type { SimulationEventHandler } from '@/modules/simulation/events/handlers/handlers.typedef';
import {
  PacketFactory,
  type PacketFactoryConfig,
} from '@/modules/traffic/PacketFactory';
import { MessageFactory } from '@/modules/traffic/MessageFactory';
import { Random } from 'random';
import type { TrafficConfig } from '@/modules/traffic/generator/generator.typedefs';
import type { TrafficGenerator } from '@/modules/traffic/generator/TrafficGenerator';
import { makeTrafficGenerator } from '@/modules/traffic/generator/makeTrafficGenerator';

export interface SimulationConfig {
  seed: number;
  network: Network;
  packets: PacketFactoryConfig;
  routing: RoutingPolicy;
  traffic: TrafficConfig;
}

export class Simulation {
  private eventsSerial = new Serial();
  private events = new PriorityQueue<SimulationEvent>(byTimeAndSerial);

  readonly trace: SimulationEvent[] = [];
  private clock = 0;

  readonly network: StatefulNetwork;
  readonly routing: RoutingPolicy;
  readonly generators: TrafficGenerator[];

  readonly messages: MessageFactory;
  readonly packets: PacketFactory;

  readonly seed: number;
  readonly random: Random;

  private handlersByEventKind: { [K in SimulationEventKind]: SimulationEventHandler<K>[] } = {
    [SIMULATION_EVENT_KIND.MESSAGE_SENT]: [handleMessageSent, pollTrafficGenerator],
    [SIMULATION_EVENT_KIND.MESSAGE_RECEIVED]: [handleMessageReceived],

    [SIMULATION_EVENT_KIND.PACKET_SENT]: [handlePacketSent],
    [SIMULATION_EVENT_KIND.PACKET_RECEIVED]: [handlePacketReceived],
    [SIMULATION_EVENT_KIND.PACKET_DROPPED]: [handlePacketDropped],

    [SIMULATION_EVENT_KIND.FRAME_FORWARDED]: [handleFrameForwarded],
    [SIMULATION_EVENT_KIND.FRAME_SENT]: [handleFrameSent],
    [SIMULATION_EVENT_KIND.FRAME_RECEIVED]: [handleFrameReceived],

    [SIMULATION_EVENT_KIND.LINK_ACQUIRED]: [handleLinkAcquired],
    [SIMULATION_EVENT_KIND.LINK_RELEASED]: [handleLinkReleased],
  };

  constructor(config: SimulationConfig) {
    this.seed = config.seed;
    this.random = new Random(config.seed);
    this.network = new StatefulNetwork(config.network);
    this.routing = config.routing;
    this.messages = new MessageFactory();
    this.packets = new PacketFactory(config.packets);

    this.generators = config.traffic.generators.map(makeTrafficGenerator(this));

    for (const generator of this.generators) {
      this.scheduleTransmission(generator);
    }
  }

  get pendingEvents(): readonly SimulationEvent[] {
    return this.events.toArray();
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

      for (const handler of handlers) {
        handler(event, this);
      }
    }
  }

  schedule(...events: RelativeSimulationEvent[]): void {
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

  scheduleTransmission(generator: TrafficGenerator): void {
    const transmission = generator.next();

    if (!transmission) {
      return;
    }

    this.schedule({
      kind: SIMULATION_EVENT_KIND.MESSAGE_SENT,
      data: {
        source: this.network.getNode(generator.sourceId),
        destination: this.network.getNode(transmission.destinationId),
        message: this.messages.fromTransmission(transmission),
        generator,
      },
      eta: transmission.time - this.clock,
    });
  }
}
