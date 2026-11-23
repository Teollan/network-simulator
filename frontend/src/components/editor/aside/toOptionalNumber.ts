export const toOptionalNumber = (value: string): number | undefined => (
  value === '' ? undefined : Number(value)
);
