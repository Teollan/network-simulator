export class NetworkNode {
  private static nextId = 1;

  id: number;
  label: string;

  constructor(label: string) {
    this.id = NetworkNode.nextId++;
    this.label = label;
  }
}
