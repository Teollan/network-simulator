export class Serial {
  private nextId;

  constructor(nextId = 1) {
    this.nextId = nextId;
  }

  next() {
    return this.nextId++;
  }
}
