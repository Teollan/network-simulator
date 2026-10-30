import type { NetworkLink } from '@/modules/network/model/NetworkLink';
import type { ElkExtendedEdge } from 'elkjs';

export const networkLinkToElkEdge = (connection: NetworkLink): ElkExtendedEdge => ({
  id: connection.id.toString(),
  sources: [connection.sourceId.toString()],
  targets: [connection.targetId.toString()],
});
