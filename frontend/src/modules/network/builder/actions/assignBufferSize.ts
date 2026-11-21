import { NETWORK_BUILDER_ACTION, type TopologyRecipeStepOf } from '@/modules/network/builder/NetworkRecipe';
import type { Network } from '@/modules/network/Network';
import type { BufferSize } from '@/modules/network/node/Node.typedefs';

type AssignBufferSizeStep = TopologyRecipeStepOf<typeof NETWORK_BUILDER_ACTION.ASSIGN_BUFFER_SIZE>;

// INFO: sets the buffer of one interface (the one towards `neighborId`), keeping the rest as they were
const withInterfaceBufferSize = (bufferSize: BufferSize, neighborId: number, size: number): BufferSize => {
  return {
    default: bufferSize.default,
    overrides: {
      ...bufferSize.overrides,
      [neighborId]: size,
    },
  };
};

// INFO: picks a size from the pool for each matching link and gives it to the interfaces on both of its ends
export function assignBufferSize(network: Network, { pool, medium }: AssignBufferSizeStep) {
  if (pool.length === 0) {
    throw new Error('Buffer size pool is empty');
  }

  if (pool.some((size) => size < 0)) {
    throw new Error(`Buffer sizes must not be negative, got [${pool.join(', ')}]`);
  }

  const bufferSizeByNodeId = new Map(network.getNodes().map((node) => [node.id, node.bufferSize]));

  const setInterface = (nodeId: number, neighborId: number, size: number) => {
    if (!bufferSizeByNodeId.has(nodeId)) {
      throw new Error(`Node with id [${nodeId}] does not exist!`);
    }

    bufferSizeByNodeId.set(nodeId, withInterfaceBufferSize(bufferSizeByNodeId.get(nodeId)!, neighborId, size));
  };

  for (const link of network.getLinks({ medium })) {
    const size = pool[Math.floor(Math.random() * pool.length)];

    setInterface(link.sourceId, link.targetId, size);
    setInterface(link.targetId, link.sourceId, size);
  }

  network.updateManyNodes([...bufferSizeByNodeId].map(([id, bufferSize]) => ({
    id,
    bufferSize,
  })));
}
