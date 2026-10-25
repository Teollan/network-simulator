import { NetworkEdge } from '@/modules/network/model/NetworkEdge';
import { NetworkNode } from '@/modules/network/model/NetworkNode';
import { shuffle } from '@/modules/util/shuffle';

export class Network {
  nodes: NetworkNode[] = [];
  edges: NetworkEdge[] = [];

  spawn(count: number, region: string) {
    this.nodes.push(
      ...Array.from(
        { length: count },
        (_, idx) => new NetworkNode(`${region}-${idx + 1}`),
      ),
    );
  }

  connect(degree: number, selectorFn: (node: NetworkNode) => boolean) {
    const nodes = this.nodes.filter(selectorFn);

    const pruferSequence = Array.from(
      { length: nodes.length - 2 },
      () => Math.floor(Math.random() * nodes.length),
    );

    const vertexSet = Array.from(
      { length: nodes.length },
      () => 0,
    );

    for (const sequenceItem of pruferSequence) {
      vertexSet[sequenceItem] += 1;
    }

    const treeEdges: NetworkEdge[] = [];

    for (const sequenceItem of pruferSequence) {
      for (let j = 0; j < nodes.length; j++) {
        if (vertexSet[j] === 0) {
          vertexSet[j] = -1;

          treeEdges.push(new NetworkEdge(nodes[j].id, nodes[sequenceItem].id));

          vertexSet[sequenceItem]--;

          break;
        }
      }
    }

    let x: NetworkNode | null = null;

    for (let i = 0; i < nodes.length; i++) {
      if (vertexSet[i] !== 0) {
        continue;
      }

      if (x === null) {
        x = nodes[i];
      } else {
        treeEdges.push(new NetworkEdge(x.id, nodes[i].id));
      }
    }

    const pairs: [number, number][] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        pairs.push([nodes[i].id, nodes[j].id]);
      }
    }

    const unusedPairs = pairs.filter(
      ([sourceId, targetId]) => {
        const existingEdge = treeEdges.find((edge) => {
          const isSameSource = edge.sourceId === sourceId;
          const isSameTarget = edge.targetId === targetId;
          const isMirrorSource = edge.sourceId === targetId;
          const isMirrorTarget = edge.targetId === sourceId;

          return (isSameSource && isSameTarget) || (isMirrorSource && isMirrorTarget);
        });

        return !(existingEdge);
      },
    );

    const expectedEdgesCount = Math.round(degree * (nodes.length / 2));

    const tagOnEdges = shuffle(unusedPairs)
      .slice(0, Math.max(0, expectedEdgesCount - treeEdges.length))
      .map(([sourceId, targetId]) => new NetworkEdge(sourceId, targetId));

    this.edges.push(...treeEdges, ...tagOnEdges);
  }
}
