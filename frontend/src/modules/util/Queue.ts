export class Queue<T> {
  private items: T[] = [];
  private capacity: number;

  constructor(capacity = Infinity) {
    this.capacity = capacity;
  }

  get length(): number {
    return this.items.length;
  }

  isFull(): boolean {
    return this.items.length >= this.capacity;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  push(item: T): void {
    if (this.isFull()) {
      throw Error('Queue is full!');
    }

    this.items.push(item);
  }

  pop(): T | null {
    return this.items.shift() ?? null;
  }
}
