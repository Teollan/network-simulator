export class NetworkEdge {
  private static nextId = 1;

  id: number;
  sourceId: number;
  targetId: number;

  constructor(sourceId: number, targetId: number) {
    this.id = NetworkEdge.nextId++;
    this.sourceId = sourceId;
    this.targetId = targetId;
  }
}
