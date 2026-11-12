import type { Link } from '@/modules/network/Link';
import type { ElkExtendedEdge } from 'elkjs';

export const networkLinkToElkEdge = (link: Link): ElkExtendedEdge => ({
  id: link.id.toString(),
  sources: [link.sourceId.toString()],
  targets: [link.targetId.toString()],
});
