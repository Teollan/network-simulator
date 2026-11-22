import type { Node } from '@/modules/network/node/Node';
import type {
  BufferSize,
  NodeType,
} from '@/modules/network/node/Node.typedefs';
import type { StatefulLink } from '@/modules/simulation/state/StatefulLink';
import type { Frame } from '@/modules/traffic/Frame';
import type { Message } from '@/modules/traffic/Message';
import {
  byOffset,
  type Packet,
} from '@/modules/traffic/Packet';
import { Queue } from '@/modules/util/Queue';

interface DataByDestination {
  link: StatefulLink;
  buffer: Queue<Frame>;
}

export class StatefulNode implements Node {
  readonly id: number;
  readonly label: string;
  readonly regionId: number;
  readonly type: NodeType;
  readonly bufferSize: BufferSize;

  private dataByDestination = new Map<StatefulNode, DataByDestination>();
  private accumulatorsByMessage = new Map<Message, Packet[]>();

  constructor(node: Node) {
    this.id = node.id;
    this.label = node.label;
    this.regionId = node.regionId;
    this.type = node.type;
    this.bufferSize = node.bufferSize;
  }

  addLinkTo(destination: StatefulNode, link: StatefulLink) {
    if (this.dataByDestination.has(destination)) {
      throw Error(`Link between nodes [${this.id}] and [${destination.id}] is already defined!`);
    }

    const bufferSize = this.bufferSize.overrides?.[destination.id] ?? this.bufferSize.default;

    this.dataByDestination.set(destination, {
      link,
      buffer: new Queue<Frame>(bufferSize),
    });
  }

  getAdjacentNodes(): StatefulNode[] {
    return [...this.dataByDestination.keys()];
  }

  getLinkTo(node: StatefulNode): StatefulLink<boolean> {
    const data = this.dataByDestination.get(node);

    if (!data) {
      throw Error('Nodes are not connected!');
    }

    return data.link.getProxy(node);
  }

  getBufferTo(node: StatefulNode): Queue<Frame> {
    const data = this.dataByDestination.get(node);

    if (!data) {
      throw Error('Nodes are not connected!');
    }

    return data.buffer;
  }

  consumePacket(packet: Packet): Message | null {
    if (packet.destination !== this) {
      throw Error('Message consumed at wrong destination!');
    }

    if (!this.accumulatorsByMessage.has(packet.message)) {
      this.accumulatorsByMessage.set(packet.message, []);
    }

    const packets = this.accumulatorsByMessage.get(packet.message)!;

    // TODO: make this an event?
    if (packets.find((existing) => existing.id === packet.id)) {
      return null;
    }

    packets.push(packet);
    packets.sort(byOffset);

    const isTerminated = packets.at(-1)!.isLast;

    if (!isTerminated) {
      return null;
    }

    const isWithoutGaps = packets.reduce((offset, packet) => {
      if (packet.offset !== offset) {
        return -1;
      }

      return offset + packet.length;
    }, 0) > 0;

    if (!isWithoutGaps) {
      return null;
    }

    return packet.message;
  }
}
