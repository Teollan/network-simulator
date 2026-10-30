export class NetworkLink {
  private static nextId = 1;

  id: number;
  sourceId: number;
  targetId: number;
  weight: number;

  constructor(sourceId: number, targetId: number, weight: number) {
    this.id = NetworkLink.nextId++;
    this.sourceId = sourceId;
    this.targetId = targetId;
    this.weight = weight;
  }

  doesLink(nodeId: number): boolean {
    const isSource = nodeId === this.sourceId;
    const isTarget = nodeId === this.targetId;

    return isSource || isTarget;
  }

  getComplement(nodeId: number): number {
    if (nodeId === this.sourceId) {
      return this.targetId;
    } else {
      return this.sourceId;
    }
  }
}
