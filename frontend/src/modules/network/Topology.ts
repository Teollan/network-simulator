import type { Region } from '@/modules/network/Region';
import type { Node } from '@/modules/network/node/Node';
import type { Link } from '@/modules/network/Link';

export interface Topology {
  regions: Region[];
  nodes: Node[];
  links: Link[];
}
