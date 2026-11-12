import { NETWORK_BUILDER_ACTION, type TopologyRecipeStepOf } from '@/modules/network/builder/NetworkRecipe';
import { shuffle } from '@/modules/util/shuffle';
import type { Network } from '@/modules/network/Network';

type LinkInsideRegionStep = TopologyRecipeStepOf<typeof NETWORK_BUILDER_ACTION.LINK_INSIDE_REGION>;

export function linkInsideRegion(network: Network, { degree, region }: LinkInsideRegionStep) {
  const nodes = network.getNodesByRegionLabel(region);

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

  const treeEdges: [number, number][] = [];

  for (const sequenceItem of pruferSequence) {
    for (let j = 0; j < nodes.length; j++) {
      if (vertexSet[j] === 0) {
        vertexSet[j] = -1;

        treeEdges.push([j, sequenceItem]);

        vertexSet[sequenceItem]--;

        break;
      }
    }
  }

  let x: number | null = null;

  for (let i = 0; i < nodes.length; i++) {
    if (vertexSet[i] !== 0) {
      continue;
    }

    if (x === null) {
      x = i;
    } else {
      treeEdges.push([x, i]);
    }
  }

  const possibleEdges: [number, number][] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      possibleEdges.push([i, j]);
    }
  }

  const unusedPairs = possibleEdges.filter(
    ([possibleSource, possibleTarget]) => {
      const existingEdge = treeEdges.find(([treeSource, treeTarget]) => {
        const isSameSource = treeSource === possibleSource;
        const isSameTarget = treeTarget === possibleTarget;
        const isMirrorSource = treeSource === possibleTarget;
        const isMirrorTarget = treeTarget === possibleSource;

        return (isSameSource && isSameTarget) || (isMirrorSource && isMirrorTarget);
      });

      return !(existingEdge);
    },
  );

  const expectedEdgesCount = Math.round(degree * (nodes.length / 2));

  const tagOnEdges = shuffle(unusedPairs)
    .slice(0, Math.max(0, expectedEdgesCount - treeEdges.length));

  network.createManyLinks(
    [...treeEdges, ...tagOnEdges].map(([sourceIdx, targetIdx]) => ({
      sourceId: nodes[sourceIdx].id,
      targetId: nodes[targetIdx].id,
    })));
}
