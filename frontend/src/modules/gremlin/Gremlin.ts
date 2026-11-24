import type { Frame } from '@/modules/traffic/Frame';
import { Random } from 'random';

export class Gremlin {
  private random: Random;

  constructor(seed: number) {
    this.random = new Random(`${seed}/gremlin`);
  }

  public rollForCorruption(frame: Frame) {
    const link = frame.source.getLinkTo(frame.destination);
    const ber = link.bitErrorRate;
    const bits = frame.packet.length * 8; // TODO: + FRAME_HEADER_LENGTH

    // math magic to avoid floating-point values collapsing to 0
    // readable formula: P(cor) = 1 - (1 - ber)^bits
    const probabilityOfCorruption = -Math.expm1(bits * Math.log1p(-ber));

    return this.random.float(0, 1) < probabilityOfCorruption;
  }

  public pickWaitTime(max: number) {
    return this.random.float(0, max);
  }
}
