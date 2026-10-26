import { EDGE_TYPE } from '@/modules/graph/view/graph.constants';
import type { NetworkConnection } from '@/modules/network/model/NetworkConnection';
import type { Edge } from '@xyflow/react';

export const networkConnectionToFlowEdge = (connection: NetworkConnection): Edge => ({
  id: connection.id.toString(),
  source: connection.sourceId.toString(),
  target: connection.targetId.toString(),
  type: EDGE_TYPE.GROUND_CONNECTION,
});
