import type { NetworkConnection } from '@/modules/network/model/NetworkConnection';
import type { ElkExtendedEdge } from 'elkjs';

export const networkConnectionToElkEdge = (connection: NetworkConnection): ElkExtendedEdge => ({
  id: connection.id.toString(),
  sources: [connection.sourceId.toString()],
  targets: [connection.targetId.toString()],
});
