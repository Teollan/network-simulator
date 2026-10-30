import { EDGE_TYPE } from '@/modules/graph/view/graph.constants';
import type { NetworkLink } from '@/modules/network/model/NetworkLink';
import type { Edge } from '@xyflow/react';

export const networkLinkToFlowEdge = (connection: NetworkLink): Edge => ({
  id: connection.id.toString(),
  source: connection.sourceId.toString(),
  target: connection.targetId.toString(),
  type: EDGE_TYPE.GROUND_CONNECTION,
});
