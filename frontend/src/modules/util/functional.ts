export const pick = <T extends object, K extends keyof T>(key: K): (obj: T) => T[K] => {
  return (obj: T) => obj[key];
};

export const notNull = <T>(value: T): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};
