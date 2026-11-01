type ComparatorFn<T> = (a: T, b: T) => boolean;

export class PriorityQueue<T> {
  private heap: T[] = [];
  private readonly comparatorFn: ComparatorFn<T>;

  constructor(comparatorFn: ComparatorFn<T> = (a: T, b: T) => a < b) {
    this.comparatorFn = comparatorFn;
  }

  public push(item: T): void {
    this.heap.push(item);

    let index = this.heap.length - 1;
    let parent = this.parent(index);

    while (index > 0 && this.comparatorFn(this.heap[index], this.heap[parent])) {
      this.swap(index, parent);

      index = parent;
      parent = this.parent(index);
    }
  }

  public pop(): T | null {
    if (this.length === 0) {
      return null;
    }

    const result = this.heap[0];

    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();

    let index = 0;

    while (true) {
      const left = this.left(index);
      const right = this.right(index);
      let best = index;

      if (left < this.length && this.comparatorFn(this.heap[left], this.heap[best])) {
        best = left;
      }

      if (right < this.length && this.comparatorFn(this.heap[right], this.heap[best])) {
        best = right;
      }

      if (best === index) {
        break;
      }

      this.swap(index, best);
      index = best;
    }

    return result;
  }

  public peek(): T | null {
    return this.heap.at(0) ?? null;
  }

  public get length() {
    return this.heap.length;
  }

  private left(index: number): number {
    return 2 * index + 1;
  }

  private right(index: number): number {
    return 2 * index + 2;
  }

  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private swap(a: number, b: number) {
    const tmp = this.heap[a];

    this.heap[a] = this.heap[b];
    this.heap[b] = tmp;
  }
}

