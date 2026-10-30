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

const MAX_PACKET_LENGTH = 10;
const HOP_LIMIT = 10;
const PACKET_HEADER_LENGTH = 2;
// bandwidth = BANDWIDTH_FACTOR / weight, so heavier links are slower
const BANDWIDTH_FACTOR = 10;
const GROUND_PROPAGATION_DELAY = 1;

export interface SimulationOptions<NS extends SimulationNodeState> {
  network: Network;
  routingPolicy: RoutingPolicy<NS>;
}

export class Simulation<NS extends SimulationNodeState> {
  private events: SimulationEvent[] = [];
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

  run() {
    while (this.events.length !== 0 && this.clock < 1000) {
      const thisTickEvents = this.events.filter((event) => event.time === this.clock);

      console.log(`---| ${this.clock} | ${thisTickEvents.length} | ${this.events.length} |---`);

      for (const event of thisTickEvents) {
        console.log(`[${event.kind}]`, event.data);

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

          case SIMULATION_EVENT_KIND.PACKET_ENQUEUED:
            this.handlePacketEnqueued(event);
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

      this.events = this.events.filter(({ time }) => time > this.clock);
      this.clock++;
    }
  };

  schedule(data: SimulationEvent | SimulationEvent[]): void {
    if (Array.isArray(data)) {
      this.events.push(...data);
    } else {
      this.events.push(data);
    }
  }

  private drop(packet: NetworkPacket, nodeId: number, reason: PacketDropReason) {
    this.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_DROPPED,
      data: { packet, nodeId, reason },
      time: this.clock + 1,
    });
  }

  private handleMessageSent({ data }: SimulationEvent<typeof SIMULATION_EVENT_KIND.MESSAGE_SENT>) {
    const {
      fromNodeId,
      toNodeId,
      message,
    } = data;

    // TODO: make it less retarded
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
      time: this.clock + 1,
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

    this.schedule(result.destinationIds.map((destinationId) => ({
      kind: SIMULATION_EVENT_KIND.PACKET_ENQUEUED,
      data: {
        frame: {
          packet,
          sourceId: packet.sourceId,
          destinationId,
        },
      },
      time: this.clock + 1,
    })));
  }

  private handlePacketEnqueued({ data }: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_ENQUEUED>) {
    const { frame } = data;

    const link = this.network.getLinkBetween(frame.sourceId, frame.destinationId);

    if (!link) {
      return;
    }

    const state = this.linkStatesByLinkId.get(link.id);

    if (!state) {
      return;
    }

    state.queue.push(data.frame);

    if (!state.isBusy) {
      this.transmitNext(link, state);
    }
  }

  private handlePacketSent({ data }: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_SENT>) {
    const { frame } = data;

    const link = this.network.getLinkBetween(frame.sourceId, frame.destinationId);

    if (!link) {
      throw Error('Packet enqueued over missing link!');
    }

    this.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_RECEIVED,
      data: { frame },
      time: this.clock + this.getPropagationDelay(link),
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

    this.schedule(result.destinationIds.map((destinationId) => {
      const link = this.network.getLinkBetween(frame.sourceId, frame.destinationId);

      if (!link) {
        throw Error('Packet enqueued over missing link!');
      }

      return {
        kind: SIMULATION_EVENT_KIND.PACKET_ENQUEUED,
        data: {
          frame: {
            packet: {
              ...packet,
              cost: packet.cost + link.weight,
              hops: packet.hops + 1,
            },
            sourceId: frame.destinationId,
            destinationId,
          },
        },
        time: this.clock + 1,
      };
    }));
  }

  private handlePacketDropped(_: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_DROPPED>) {
    // TODO: collect loss stats
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

    // TODO: drop the ceil once the event queue supports fractional time
    return Math.ceil((PACKET_HEADER_LENGTH + frame.packet.length) / bandwidth);
  }

  private getPropagationDelay(_link: NetworkLink): number {
    // TODO: per link type, satellite links are much slower
    return GROUND_PROPAGATION_DELAY;
  }
}
