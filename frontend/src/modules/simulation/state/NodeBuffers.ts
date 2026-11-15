import type { Frame } from '@/modules/traffic/Frame';
import { Queue } from '@/modules/util/Queue';

export class NodeBuffers {
  private buffersByTargetId = new Map<number, Queue<Frame>>();

  constructor(nodeIds: number[], bufferCapacity: number) {
    for (const nodeId of nodeIds) {
      this.buffersByTargetId.set(nodeId, new Queue<Frame>(bufferCapacity));
    }
  };

  to(targetId: number): Queue<Frame> {
    const buffer = this.buffersByTargetId.get(targetId);

    if (!buffer) {
      throw Error(`Buffer for target node [${targetId}] does not exist!`);
    }

    return buffer;
  }
};
