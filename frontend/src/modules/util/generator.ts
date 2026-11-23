import type { Random } from 'random';

export type Generator<T> = () => T

export function makeConstantGenerator<T>(value: T): Generator<T> {
  return () => value;
}

export function makeIntegerGenerator(min: number, max: number, random: Random): Generator<number> {
  return () => random.integer(min, max);
}

export function makePoolGenerator<T>(pool: T[], random: Random): Generator<T> {
  if (pool.length === 0) {
    throw Error('Pool must not be empty');
  }

  return () => random.choice(pool)!;
}
