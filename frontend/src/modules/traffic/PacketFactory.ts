import type { StatefulNode } from '@/modules/simulation/state/StatefulNode';
import type { Message } from '@/modules/traffic/Message';
import type { Packet } from '@/modules/traffic/Packet';
import { Serial } from '@/modules/util/Serial';

export interface PacketFactoryConfig {
  maxSize: number;
  maxHops: number;
}

export class PacketFactory {
  private serial: Serial = new Serial();
  readonly maxSize: number;
  readonly maxHops: number;

  constructor(config: PacketFactoryConfig) {
    this.maxSize = config.maxSize;
    this.maxHops = config.maxHops;
  }

  splitMessage(message: Message, source: StatefulNode, destination: StatefulNode): Packet[] {
    const {
      serial,
      maxSize,
      maxHops,
    } = this;

    const numberOfPackets = Math.ceil(message.size / maxSize);

    const packets = Array.from(
      { length: numberOfPackets },
      (_, idx): Packet => {
        const offset = idx * maxSize;
        const isLast = idx === (numberOfPackets - 1);

        return {
          id: serial.next(),

          message,
          source,
          destination,

          offset,
          length: isLast ? message.size - offset : maxSize,
          isLast,
          hopLimit: maxHops,
          cost: 0,
        };
      },
    );

    return packets;
  }
}
