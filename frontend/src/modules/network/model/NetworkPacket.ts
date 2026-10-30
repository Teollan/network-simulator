export interface CreateNetworkPacketOptions {
  messageId: number;
  offset: number;
  length: number;
  isLast: boolean;

  sourceId: number;
  destinationId: number;
  hopLimit: number;
}

export class NetworkPacket {
  private static nextId = 1;
  readonly id: number;

  readonly messageId: number;
  readonly offset: number;
  readonly length: number;
  readonly isLast: boolean;

  readonly sourceId: number;
  readonly destinationId: number;
  readonly hopLimit: number;
  cost = 0;
  hops = 0;

  constructor(options: CreateNetworkPacketOptions) {
    this.id = NetworkPacket.nextId++;

    this.messageId = options.messageId;
    this.offset = options.offset;
    this.length = options.length;
    this.isLast = options.isLast;

    this.sourceId = options.sourceId;
    this.destinationId = options.destinationId;
    this.hopLimit = options.hopLimit;
  }
}
