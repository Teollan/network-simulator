import { EDGE_TYPE } from '@/components/editor/canvas/edge/edge.constants';
import type { Link } from '@/modules/network/Link';
import type { Edge } from '@xyflow/react';

export const networkLinkToFlowEdge = (link: Link): Edge => ({
  id: link.id.toString(),
  source: link.sourceId.toString(),
  target: link.targetId.toString(),
  type: EDGE_TYPE.GROUND_CONNECTION,
});
