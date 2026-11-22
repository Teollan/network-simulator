import {
  TOPOLOGY_BUILDER_ACTION as ACTION,
  type TopologyBuilderAction,
  type TopologyBuilderActionOptions as Options,
  type TopologySpec,
} from '@/modules/network/builder/TopologySpec';
import {
  LINK_MEDIUM,
  LINK_TYPE,
} from '@/modules/network/Link';
import { Network } from '@/modules/network/Network';
import { NODE_TYPE } from '@/modules/network/node/Node.constants';
import type { BufferSize } from '@/modules/network/node/Node.typedefs';
import { Random } from 'random';

export class TopologyBuilder {
  readonly seed: number;

  private random: Random;
  private topology: Network = new Network();

  constructor(seed: number) {
    this.seed = seed;
    this.random = new Random(seed);
  }

  // INFO: starts over from an empty network and the beginning of the seed's stream,
  // so building the same spec twice gives the same network
  public start() {
    this.random = new Random(this.seed);
    this.topology = new Network();
  }

  public build(spec: TopologySpec): Network {
    this.start();

    for (const action of spec.actions) {
      this.dispatch(action);
    }

    return this.finish();
  }

  public finish(): Network {
    return this.topology;
  }

  private dispatch(action: TopologyBuilderAction) {
    switch (action.kind) {
      case ACTION.CREATE_REGION:
        this.createRegion(action.options);
        break;
      case ACTION.LINK_INSIDE_REGION:
        this.linkInsideRegion(action.options);
        break;
      case ACTION.LINK_REGIONS:
        this.linkRegions(action.options);
        break;
      case ACTION.ATTACH_WORKSTATIONS:
        this.attachWorkstations(action.options);
        break;
      case ACTION.ASSIGN_LINK_WEIGHTS:
        this.assignLinkWeights(action.options);
        break;
      case ACTION.ASSIGN_BIT_ERROR_RATE:
        this.assignBitErrorRate(action.options);
        break;
      case ACTION.ASSIGN_LINK_TYPE:
        this.assignLinkType(action.options);
        break;
      case ACTION.ASSIGN_BUFFER_SIZE:
        this.assignBufferSize(action.options);
        break;
    }
  }

  public createRegion({
    label,
    size,
  }: Options<typeof ACTION.CREATE_REGION>) {
    const region = this.topology.createRegion({ label });

    this.topology.createManyNodes(
      Array.from({ length: size }, (_, i) => ({
        label: `${region.label}-${i}`,
        regionId: region.id,
      })),
    );
  }

  public linkInsideRegion({
    region,
    degree,
  }: Options<typeof ACTION.LINK_INSIDE_REGION>) {
    const nodes = this.topology.getNodesByRegionLabel(region);

    const pruferSequence = Array.from(
      { length: nodes.length - 2 },
      () => this.random.integer(0, nodes.length - 1),
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

    const tagOnEdges = this.random.shuffle(unusedPairs)
      .slice(0, Math.max(0, expectedEdgesCount - treeEdges.length));

    this.topology.createManyLinks(
      [...treeEdges, ...tagOnEdges].map(([sourceIdx, targetIdx]) => ({
        sourceId: nodes[sourceIdx].id,
        targetId: nodes[targetIdx].id,
      })),
    );
  }

  public linkRegions({
    sourceRegion,
    targetRegion,
  }: Options<typeof ACTION.LINK_REGIONS>) {
    const sourceNodes = this.topology.getNodesByRegionLabel(sourceRegion);
    const randomSourceNode = this.random.choice(sourceNodes);

    const targetNodes = this.topology.getNodesByRegionLabel(targetRegion);
    const randomTargetNode = this.random.choice(targetNodes);

    if (!randomSourceNode || !randomTargetNode) {
      throw new Error(`Cannot link empty region "${sourceNodes.length === 0 ? sourceRegion : targetRegion}"`);
    }

    this.topology.createLink({
      sourceId: randomSourceNode.id,
      targetId: randomTargetNode.id,
      medium: LINK_MEDIUM.SATELLITE,
    });
  }

  public attachWorkstations({
    region,
    every,
  }: Options<typeof ACTION.ATTACH_WORKSTATIONS>) {
    const routers = this.topology.getNodesByRegionLabel(region).filter(
      (node) => node.type === NODE_TYPE.ROUTER,
    );

    const hosts = routers.filter((_, i) => (
      ((i + 1) % every) === 0
    ));

    const workstations = this.topology.createManyNodes(hosts.map((router) => ({
      label: `${router.label}-WS`,
      regionId: router.regionId,
      type: NODE_TYPE.WORKSTATION,
    })));

    this.topology.createManyLinks(hosts.map((router, i) => ({
      sourceId: router.id,
      targetId: workstations[i].id,
    })));
  }

  public assignLinkWeights({
    pool,
  }: Options<typeof ACTION.ASSIGN_LINK_WEIGHTS>) {
    if (pool.length === 0) {
      throw new Error('Link weight pool is empty');
    }

    const links = this.topology.getLinks();

    this.topology.updateManyLinks(links.map((link) => ({
      id: link.id,
      weight: this.random.choice(pool),
    })));
  }

  public assignBitErrorRate({
    value,
    medium,
  }: Options<typeof ACTION.ASSIGN_BIT_ERROR_RATE>) {
    if (value < 0 || value > 1) {
      throw new Error(`Bit error rate must be within [0, 1], got ${value}`);
    }

    const links = this.topology.getLinks({ medium });

    this.topology.updateManyLinks(links.map((link) => ({
      id: link.id,
      bitErrorRate: value,
    })));
  }

  public assignLinkType({
    halfDuplexShare,
    medium,
  }: Options<typeof ACTION.ASSIGN_LINK_TYPE>) {
    if (halfDuplexShare < 0 || halfDuplexShare > 1) {
      throw new Error(`Half-duplex share must be within [0, 1], got ${halfDuplexShare}`);
    }

    const links = this.random.shuffle(this.topology.getLinks({ medium }));
    const halfDuplexCount = Math.round(halfDuplexShare * links.length);

    this.topology.updateManyLinks(links.map((link, idx) => ({
      id: link.id,
      type: idx < halfDuplexCount ? LINK_TYPE.HALF_DUPLEX : LINK_TYPE.FULL_DUPLEX,
    })));
  }

  public assignBufferSize({
    pool,
    medium,
  }: Options<typeof ACTION.ASSIGN_BUFFER_SIZE>) {
    if (pool.length === 0) {
      throw new Error('Buffer size pool is empty');
    }

    if (pool.some((size) => size < 0)) {
      throw new Error(`Buffer sizes must not be negative, got [${pool.join(', ')}]`);
    }

    const bufferSizeByNodeId = new Map(this.topology.getNodes().map((node) => [node.id, node.bufferSize]));

    const setInterface = (nodeId: number, neighborId: number, size: number) => {
      if (!bufferSizeByNodeId.has(nodeId)) {
        throw new Error(`Node with id [${nodeId}] does not exist!`);
      }

      bufferSizeByNodeId.set(nodeId, withInterfaceBufferSize(bufferSizeByNodeId.get(nodeId)!, neighborId, size));
    };

    for (const link of this.topology.getLinks({ medium })) {
      const size = this.random.choice(pool)!;

      setInterface(link.sourceId, link.targetId, size);
      setInterface(link.targetId, link.sourceId, size);
    }

    this.topology.updateManyNodes([...bufferSizeByNodeId].map(([id, bufferSize]) => ({
      id,
      bufferSize,
    })));
  }
}

const withInterfaceBufferSize = (bufferSize: BufferSize, neighborId: number, size: number): BufferSize => {
  return {
    default: bufferSize.default,
    overrides: {
      ...bufferSize.overrides,
      [neighborId]: size,
    },
  };
};
