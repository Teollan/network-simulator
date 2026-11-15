export const pick = <T extends object, K extends keyof T>(key: K): (obj: T) => T[K] => {
  return (obj: T) => obj[key];
};
