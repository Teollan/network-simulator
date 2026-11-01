import { describe, expect, it } from 'vitest';
import { PriorityQueue } from '@/modules/util/PriorityQueue/PriorityQueue';

const drain = <T>(queue: PriorityQueue<T>): T[] => {
  const result: T[] = [];

  for (let item = queue.pop(); item !== null; item = queue.pop()) {
    result.push(item);
  }

  return result;
};

const pushAll = <T>(queue: PriorityQueue<T>, items: T[]) => {
  for (const item of items) {
    queue.push(item);
  }
};

const randomNumbers = (count: number): number[] => (
  Array.from({ length: count }, () => Math.floor(Math.random() * 1000))
);

describe('PriorityQueue<number>', () => {
  describe('empty queue', () => {
    it('should have a length of 0', () => {
      expect(new PriorityQueue<number>().length).toBe(0);
    });

    it('should return null on pop', () => {
      expect(new PriorityQueue<number>().pop()).toBeNull();
    });

    it('should return null on peek', () => {
      expect(new PriorityQueue<number>().peek()).toBeNull();
    });

    it('should return null on pop after being drained', () => {
      const queue = new PriorityQueue<number>();

      pushAll(queue, [2, 1]);
      queue.pop();
      queue.pop();

      expect(queue.pop()).toBeNull();
      expect(queue.peek()).toBeNull();
      expect(queue.length).toBe(0);
    });

    it('should be reusable after being drained', () => {
      const queue = new PriorityQueue<number>();

      pushAll(queue, [3, 1]);
      drain(queue);
      pushAll(queue, [5, 4]);

      expect(drain(queue)).toEqual([4, 5]);
    });
  });

  describe('single item', () => {
    it('should peek and pop the only item', () => {
      const queue = new PriorityQueue<number>();

      queue.push(42);

      expect(queue.peek()).toBe(42);
      expect(queue.pop()).toBe(42);
      expect(queue.length).toBe(0);
    });

    it('should return 0 instead of treating it as empty', () => {
      const queue = new PriorityQueue<number>();

      queue.push(0);

      expect(queue.peek()).toBe(0);
      expect(queue.pop()).toBe(0);
    });
  });

  describe('ordering', () => {
    it('should pop in ascending order', () => {
      const queue = new PriorityQueue<number>();

      pushAll(queue, [5, 3, 8, 1, 9, 2, 7]);

      expect(drain(queue)).toEqual([1, 2, 3, 5, 7, 8, 9]);
    });

    it('should handle input that is already ascending', () => {
      const queue = new PriorityQueue<number>();

      pushAll(queue, [1, 2, 3, 4, 5]);

      expect(drain(queue)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle input that is descending', () => {
      const queue = new PriorityQueue<number>();

      pushAll(queue, [5, 4, 3, 2, 1]);

      expect(drain(queue)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should keep duplicates', () => {
      const queue = new PriorityQueue<number>();

      pushAll(queue, [3, 1, 3, 1, 2]);

      expect(drain(queue)).toEqual([1, 1, 2, 3, 3]);
    });

    it('should handle negatives, zero and fractions', () => {
      const queue = new PriorityQueue<number>();

      pushAll(queue, [0, -2.5, 12.5, -10, 0.1]);

      expect(drain(queue)).toEqual([-10, -2.5, 0, 0.1, 12.5]);
    });

    it('should match a sort on a large random input', () => {
      const queue = new PriorityQueue<number>();
      const input = randomNumbers(1000);

      pushAll(queue, input);

      expect(drain(queue)).toEqual([...input].sort((a, b) => a - b));
    });
  });

  describe('peek', () => {
    it('should return the minimum without removing it', () => {
      const queue = new PriorityQueue<number>();

      pushAll(queue, [4, 2, 6]);

      expect(queue.peek()).toBe(2);
      expect(queue.peek()).toBe(2);
      expect(queue.length).toBe(3);
    });

    it('should track the minimum as items are pushed', () => {
      const queue = new PriorityQueue<number>();

      queue.push(5);
      expect(queue.peek()).toBe(5);

      queue.push(7);
      expect(queue.peek()).toBe(5);

      queue.push(1);
      expect(queue.peek()).toBe(1);
    });
  });

  describe('length', () => {
    it('should grow on push and shrink on pop', () => {
      const queue = new PriorityQueue<number>();

      pushAll(queue, [1, 2, 3]);
      expect(queue.length).toBe(3);

      queue.pop();
      expect(queue.length).toBe(2);
    });

    it('should not go negative when popping an empty queue', () => {
      const queue = new PriorityQueue<number>();

      queue.pop();

      expect(queue.length).toBe(0);
    });
  });

  it('should stay ordered with interleaved push and pop', () => {
    const queue = new PriorityQueue<number>();

    pushAll(queue, [5, 3]);
    expect(queue.pop()).toBe(3);

    pushAll(queue, [4, 1]);
    expect(queue.pop()).toBe(1);

    queue.push(2);
    expect(drain(queue)).toEqual([2, 4, 5]);
  });

  it('should act as a max-heap with a reversed comparator', () => {
    const queue = new PriorityQueue<number>((a, b) => a > b);

    pushAll(queue, [5, 3, 8, 1, 9]);

    expect(drain(queue)).toEqual([9, 8, 5, 3, 1]);
  });
});

interface TestEvent {
  time: number;
  seq: number;
  label: string;
}

const byTimeThenSeq = (a: TestEvent, b: TestEvent) => (
  a.time < b.time || (a.time === b.time && a.seq < b.seq)
);

describe('PriorityQueue<TestEvent>', () => {
  it('should return null when empty', () => {
    const queue = new PriorityQueue<TestEvent>(byTimeThenSeq);

    expect(queue.pop()).toBeNull();
    expect(queue.peek()).toBeNull();
  });

  it('should pop events in time order', () => {
    const queue = new PriorityQueue<TestEvent>(byTimeThenSeq);

    pushAll(queue, [
      { time: 30, seq: 0, label: 'c' },
      { time: 10, seq: 1, label: 'a' },
      { time: 20, seq: 2, label: 'b' },
    ]);

    expect(drain(queue).map(({ label }) => label)).toEqual(['a', 'b', 'c']);
  });

  it('should break time ties by seq', () => {
    const queue = new PriorityQueue<TestEvent>(byTimeThenSeq);

    pushAll(queue, [
      { time: 5, seq: 3, label: 'd' },
      { time: 5, seq: 0, label: 'a' },
      { time: 1, seq: 4, label: 'first' },
      { time: 5, seq: 2, label: 'c' },
      { time: 5, seq: 1, label: 'b' },
    ]);

    expect(drain(queue).map(({ label }) => label)).toEqual(['first', 'a', 'b', 'c', 'd']);
  });

  it('should keep schedule order for many events at the same time', () => {
    const queue = new PriorityQueue<TestEvent>(byTimeThenSeq);
    const events = Array.from({ length: 100 }, (_, seq) => ({ time: 7, seq, label: `${seq}` }));

    pushAll(queue, [...events].reverse());

    expect(drain(queue).map(({ seq }) => seq)).toEqual(events.map(({ seq }) => seq));
  });

  it('should match a sort on a large random input', () => {
    const queue = new PriorityQueue<TestEvent>(byTimeThenSeq);
    const events = randomNumbers(500).map((time, seq) => ({ time, seq, label: `${seq}` }));

    pushAll(queue, events);

    const expected = [...events].sort((a, b) => a.time - b.time || a.seq - b.seq);

    expect(drain(queue)).toEqual(expected);
  });

  it('should return the same object references it was given', () => {
    const queue = new PriorityQueue<TestEvent>(byTimeThenSeq);
    const event = { time: 1, seq: 0, label: 'a' };

    queue.push(event);

    expect(queue.peek()).toBe(event);
    expect(queue.pop()).toBe(event);
  });

  it('should accept an event scheduled at the current head time while running', () => {
    const queue = new PriorityQueue<TestEvent>(byTimeThenSeq);

    pushAll(queue, [
      { time: 10, seq: 0, label: 'a' },
      { time: 20, seq: 1, label: 'c' },
    ]);

    const head = queue.pop();

    queue.push({ time: 10, seq: 2, label: 'b' });

    expect(head?.label).toBe('a');
    expect(drain(queue).map(({ label }) => label)).toEqual(['b', 'c']);
  });
});
