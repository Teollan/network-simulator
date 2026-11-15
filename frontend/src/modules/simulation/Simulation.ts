import type { Network } from '@/modules/network/Network';
import type { Frame } from '@/modules/traffic/Frame';
import { Packet } from '@/modules/traffic/Packet';
import type { RoutingPolicy, RoutingPolicyContext } from '@/modules/routing/RoutingPolicy';
import { isLinkBusy, type StatefulLink } from '@/modules/simulation/state/StatefulLink';
import {
  PACKET_DROP_REASON,
  SIMULATION_EVENT_KIND,
  type PacketDropReason,
  type SimulationEvent,
} from '@/modules/simulation/SimulationEvent';
import { PriorityQueue } from '@/modules/util/PriorityQueue/PriorityQueue';
import { StatefulNetwork } from '@/modules/simulation/state/StatefulNetwork';

const MAX_PACKET_LENGTH = 10;
const HOP_LIMIT = 10;
const PACKET_HEADER_LENGTH = 2;
const BANDWIDTH_FACTOR = 10;
const GROUND_PROPAGATION_DELAY = 1;
const PROCESSING_DELAY = 1;

export interface SimulationOptions<T> {
  network: Network;
  routingPolicy: RoutingPolicy<T>;
}

type ScheduledSimulationEvent = SimulationEvent & { seq: number };

const byTimeThenSeq = (a: ScheduledSimulationEvent, b: ScheduledSimulationEvent) => (
  a.time < b.time || (a.time === b.time && a.seq < b.seq)
);

export class Simulation<T> {
  private events = new PriorityQueue<ScheduledSimulationEvent>(byTimeThenSeq);
  readonly trace: SimulationEvent[] = [];
  private nextSeq = 0;
  private clock = 0;

  private network: StatefulNetwork;
  private routingPolicy: RoutingPolicy<T>;

  constructor(network: Network, routingPolicy: RoutingPolicy<T>) {
    this.network = new StatefulNetwork(network);
    this.routingPolicy = routingPolicy;
  }

  private get routingContext(): RoutingPolicyContext {
    return {
      network: this.network,
    };
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

      this.events.push({
        ...event,
        seq: this.nextSeq++,
      });
    }
  }

  private drop(packet: Packet, nodeId: number, reason: PacketDropReason) {
    this.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_DROPPED,
      data: {
        packet,
        nodeId,
        reason,
      },
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

        return new Packet({
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

    const destinationIds = this.routingPolicy.onPacket(
      {
        packet,
        sourceId: packet.sourceId,
        destinationId: packet.sourceId,
      },
      this.routingContext,
    );

    if (!destinationIds.length) {
      this.drop(packet, packet.sourceId, PACKET_DROP_REASON.NO_ROUTE);

      return;
    }

    for (const destinationId of destinationIds) {
      this.enqueueFrame({
        packet,
        sourceId: packet.sourceId,
        destinationId,
      });
    }
  }

  private handlePacketSent({ data }: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_SENT>) {
    const { frame } = data;

    const link = this.network.getLinkBetween(frame.sourceId, frame.destinationId);

    // the receiving node processes the frame before it counts as received,
    // so routing still happens at the moment the frame is enqueued further
    this.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_RECEIVED,
      data: { frame },
      time: this.clock + this.getPropagationDelay(link) + PROCESSING_DELAY,
    });

    this.network.updateLinkIsBusy(link.id, frame.sourceId, false);
    this.sendNextFrame(frame.destinationId, frame.sourceId);
  }

  private handlePacketReceived({ data }: SimulationEvent<typeof SIMULATION_EVENT_KIND.PACKET_RECEIVED>) {
    const { frame } = data;
    const { packet } = frame;

    if (packet.destinationId === frame.destinationId) {
      return;
    }

    // hops are counted on forward, so the link just crossed isn't in packet.hops yet
    if (packet.hops + 1 >= packet.hopLimit) {
      this.drop(packet, frame.destinationId, PACKET_DROP_REASON.HOP_LIMIT);

      return;
    }

    const destinationIds = this.routingPolicy.onPacket(frame, this.routingContext);

    if (!destinationIds.length) {
      this.drop(packet, frame.destinationId, PACKET_DROP_REASON.NO_ROUTE);

      return;
    }

    for (const destinationId of destinationIds) {
      const link = this.network.getLinkBetween(frame.destinationId, destinationId);

      this.enqueueFrame({
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

  private enqueueFrame(frame: Frame) {
    this.network.pushFrame(frame);

    const link = this.network.getLinkBetween(frame.sourceId, frame.destinationId);

    if (!isLinkBusy(link, frame.sourceId)) {
      this.sendNextFrame(frame.sourceId, frame.destinationId);
    }
  }

  private sendNextFrame(sourceId: number, targetId: number) {
    const link = this.network.getLinkBetween(sourceId, targetId);

    if (isLinkBusy(link, sourceId)) {
      throw Error(`Link between nodes [${sourceId}] and [${targetId}] is busy!`);
    }

    const sourceBuffer = this.network.getNode(sourceId).buffers.to(targetId);
    const targetBuffer = this.network.getNode(targetId).buffers.to(sourceId);

    const frame = sourceBuffer.pop() || targetBuffer.pop();

    if (!frame) {
      this.network.updateLinkIsBusy(link.id, sourceId, false);

      return;
    }

    this.schedule({
      kind: SIMULATION_EVENT_KIND.PACKET_SENT,
      data: { frame },
      time: this.clock + this.getTransmissionTime(frame, link),
    });
  }

  private getTransmissionTime(frame: Frame, link: StatefulLink): number {
    const bandwidth = BANDWIDTH_FACTOR / link.weight;

    return (PACKET_HEADER_LENGTH + frame.packet.length) / bandwidth;
  }

  private getPropagationDelay(_link: StatefulLink): number {
    // TODO: per link type, satellite links are much slower
    return GROUND_PROPAGATION_DELAY;
  }
}
