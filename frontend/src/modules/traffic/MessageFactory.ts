import type { Message } from '@/modules/traffic/Message';
import type { Transmission } from '@/modules/traffic/Transmission';
import { Serial } from '@/modules/util/Serial';

export class MessageFactory {
  private serial: Serial = new Serial();

  fromTransmission(transmission: Transmission): Message {
    return {
      id: this.serial.next(),
      size: transmission.size,
    };
  }
}
