import rng from 'random';

export const getRandomSeed = () => {
  return rng.integer(0, Number.MAX_SAFE_INTEGER);
};
