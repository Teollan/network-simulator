import type { Network } from '@/modules/network/model/Network';
import type { NetworkFrame } from '@/modules/network/model/NetworkFrame';
import type { NetworkLink } from '@/modules/network/model/NetworkLink';
import { NetworkPacket } from '@/modules/network/model/NetworkPacket';
import type { RoutingPolicy, RoutingPolicyContext } from '@/modules/routing/model/RoutingPolicy';
import type { SimulationLinkState } from '@/modules/simulation/model/SimulationLinkState';
import {
  PACKET_DROP_REASON,
  SIMULATION_EVENT_KIND,
  type PacketDropReason,
  type SimulationEvent,
} from '@/modules/simulation/model/SimulationEvent';
import type { SimulationNodeState } from '@/modules/simulation/model/SimulationNodeState';
import { PriorityQueue } from '@/modules/util/PriorityQueue/PriorityQueue';

const MAX_PACKET_LENGTH = 10;
const HOP_LIMIT = 10;
const PACKET_HEADER_LENGTH = 2;
const BANDWIDTH_FACTOR = 10;
const GROUND_PROPAGATION_DELAY = 1;
const PROCESSING_DELAY = 1;

export interface SimulationOptions<NS extends SimulationNodeState> {
  network: Network;
  routingPolicy: RoutingPolicy<NS>;
}

type ScheduledSimulationEvent = SimulationEvent & { seq: number };

const byTimeThenSeq = (a: ScheduledSimulationEvent, b: ScheduledSimulationEvent) => (
  a.time < b.time || (a.time === b.time && a.seq < b.seq)
);

export class Simulation<NS extends SimulationNodeState> {
  private events = new PriorityQueue<ScheduledSimulationEvent>(byTimeThenSeq);
  private nextSeq = 0;
  private clock = 0;
  private nodeStatesByNodeId = new Map<number, NS>;
  private linkStatesByLinkId = new Map<number, SimulationLinkState>;

  readonly network: Network;
  readonly routingPolicy: RoutingPolicy<NS>;

  constructor(network: Network, routingPolicy: RoutingPolicy<NS>) {
    this.network = network;
    this.routingPolicy = routingPolicy;

    for (const link of network.links) {
      this.linkStatesByLinkId.set(link.id, { queue: [], isBusy: false });
    }

    for (const node of network.nodes) {
      this.nodeStatesByNodeId.set(node.id, routingPolicy.initState(node, this.routingContext));
    }
  }

  private get routingContext(): RoutingPolicyContext {
    return {
      network: this.network,
      linkStatesByLinkId: this.linkStatesByLinkId,
    };
  }

  run(until = Infinity) {
    while (this.events.length > 0) {
      const event = this.events.peek();

      if (!event || event.time > until) {
        break;
      }

      this.events.pop();
      this.clock = event.time;

      console.log(`[${event.time}] [${event.kind}]`, event.data);

      this.dispatch(event);
    }
  }

  private dispatch(event: SimulationEvent) {
    switch (event.kind) {
      case SIMULATION_EVENT_KIND.MESSAGE_SENT:
        this.handleMessageSent(event);
        break;

      case SIMULATION_EVENT_KIND.MESSAGE_RECEIVED:
        this.handleMessageReceived(event);
        break;

      case SIMULATION_EVENT_KIND.PACKET_CREATED:
        this.handlePacketCreated(event);
        break;

      case SIMULATION_EVENT_KIND.PACKET_SENT:
        this.handlePacketSent(event);
        break;

      case SIMULATION_EVENT_KIND.PACKET_RECEIVED:
        this.handlePacketReceived(event);
        break;

      case SIMULATION_EVENT_KIND.PACKET_DROPPED:
        this.handlePacketDropped(event);
        break;
    }
  }

  schedule(data: SimulationEvent | SimulationEvent[]): void {
    const events = Array.isArray(data) ? data : [data];

    for (const event of events) {
      if (event.time < this.clock) {
        throw Error(`Event ${event.kind} scheduled at ${event.time}, before the clock at ${this.clock}!`);
      }

      this.events.push({ ...event, seq: this.nextSeq++ });
    }
  }

  private drop(packet: NetworkPacket, nodeId: number, reason: PacketDropReason) {
    this.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_DROPPED,
      data: { packet, nodeId, reason },
      time: this.clock,
    });
  }

  private handleMessageSent({ data }: SimulationEvent<typeof SIMULATION_EVENT_KIND.MESSAGE_SENT>) {
    const {
      fromNodeId,
      toNodeId,
      message,
    } = data;

    const numberOfPackets = Math.ceil(message.length / MAX_PACKET_LENGTH);

    const packets = Array.from(
      { length: numberOfPackets },
      (_, idx) => {
        const offset = idx * MAX_PACKET_LENGTH;
        const isLast = idx === (numberOfPackets - 1);

        return new NetworkPacket({
          messageId: message.id,
          offset,
          length: isLast ? message.length - offset : MAX_PACKET_LENGTH,
          isLast,

          sourceId: fromNodeId,
          destinationId: toNodeId,
          hopLimit: HOP_LIMIT,
        });
      },
    );

    this.schedule(packets.map((packet) => ({
      kind: SIMULATION_EVENT_KIND.PACKET_CREATED,
      data: { packet },
      time: this.clock,
    })));
  }

  private handleMessageReceived(_: SimulationEvent<typeof SIMULATION_EVENT_KIND.MESSAGE_RECEIVED>) {
    // TODO: do something...
  }

  private handlePacketCreated({ data }: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_CREATED>) {
    const { packet } = data;
    const state = this.nodeStatesByNodeId.get(packet.sourceId);

    if (!state) {
      return;
    }

    const result = this.routingPolicy.onPacket(
      state,
      { packet, sourceId: packet.sourceId, destinationId: packet.sourceId },
      this.routingContext,
    );

    this.nodeStatesByNodeId.set(packet.sourceId, result.state);

    if (!result.destinationIds.length) {
      this.drop(packet, packet.sourceId, PACKET_DROP_REASON.NO_ROUTE);

      return;
    }

    for (const destinationId of result.destinationIds) {
      this.enqueue({
        packet,
        sourceId: packet.sourceId,
        destinationId,
      });
    }
  }

  private handlePacketSent({ data }: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_SENT>) {
    const { frame } = data;

    const link = this.network.getLinkBetween(frame.sourceId, frame.destinationId);

    if (!link) {
      throw Error('Packet enqueued over missing link!');
    }

    // the receiving node processes the frame before it counts as received,
    // so routing still happens at the moment the frame is enqueued further
    this.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_RECEIVED,
      data: { frame },
      time: this.clock + this.getPropagationDelay(link) + PROCESSING_DELAY,
    });

    const state = this.linkStatesByLinkId.get(link.id);

    if (!state) {
      return;
    }

    this.transmitNext(link, state);
  }

  private handlePacketReceived({ data }: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_RECEIVED>) {
    const { frame } = data;
    const { packet } = frame;
    const state = this.nodeStatesByNodeId.get(frame.destinationId);

    if (!state) {
      return;
    }

    if (packet.destinationId === frame.destinationId) {
      console.log('BINGO!');

      return;
    }

    // hops are counted on forward, so the link just crossed isn't in packet.hops yet
    if (packet.hops + 1 >= packet.hopLimit) {
      this.drop(packet, frame.destinationId, PACKET_DROP_REASON.HOP_LIMIT);

      return;
    }

    const result = this.routingPolicy.onPacket(state, frame, this.routingContext);

    this.nodeStatesByNodeId.set(frame.destinationId, result.state);

    if (!result.destinationIds.length) {
      this.drop(packet, frame.destinationId, PACKET_DROP_REASON.NO_ROUTE);

      return;
    }

    for (const destinationId of result.destinationIds) {
      const link = this.network.getLinkBetween(frame.destinationId, destinationId);

      if (!link) {
        throw Error('Packet routed over missing link!');
      }

      this.enqueue({
        packet: {
          ...packet,
          cost: packet.cost + link.weight,
          hops: packet.hops + 1,
        },
        sourceId: frame.destinationId,
        destinationId,
      });
    }
  }

  private handlePacketDropped(_: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_DROPPED>) {
    // TODO: collect loss stats
  }

  private enqueue(frame: NetworkFrame) {
    const link = this.network.getLinkBetween(frame.sourceId, frame.destinationId);
    const state = link && this.linkStatesByLinkId.get(link.id);

    if (!link || !state) {
      throw Error('Packet enqueued over missing link!');
    }

    state.queue.push(frame);

    if (!state.isBusy) {
      this.transmitNext(link, state);
    }
  }

  private transmitNext(link: NetworkLink, state: SimulationLinkState) {
    const frame = state.queue.shift();

    state.isBusy = Boolean(frame);

    if (!frame) {
      return;
    }

    this.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_SENT,
      data: { frame },
      time: this.clock + this.getTransmissionTime(frame, link),
    });
  }

  private getTransmissionTime(frame: NetworkFrame, link: NetworkLink): number {
    const bandwidth = BANDWIDTH_FACTOR / link.weight;

    return (PACKET_HEADER_LENGTH + frame.packet.length) / bandwidth;
  }

  private getPropagationDelay(_link: NetworkLink): number {
    // TODO: per link type, satellite links are much slower
    return GROUND_PROPAGATION_DELAY;
  }
}
