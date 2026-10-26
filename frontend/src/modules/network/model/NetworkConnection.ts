export class NetworkConnection {
  private static nextId = 1;

  id: number;
  sourceId: number;
  targetId: number;

  constructor(sourceId: number, targetId: number) {
    this.id = NetworkConnection.nextId++;
    this.sourceId = sourceId;
    this.targetId = targetId;
  }
}
