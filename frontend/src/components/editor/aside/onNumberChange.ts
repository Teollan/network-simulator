import type { ChangeEvent } from 'react';

export const onNumberChange = (callbackFn: (value: number) => void) => (
  ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (Number.isFinite(target.valueAsNumber)) {
      callbackFn(target.valueAsNumber);
    }
  }
);
