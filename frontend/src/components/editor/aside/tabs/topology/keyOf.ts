import { Serial } from '@/modules/util/Serial';

const keys = new WeakMap<object, number>();
const keysSerial = new Serial();

// INFO: a React key that follows an immutable object around, e.g. through reordering;
// replacing the object (an edit) gives it a new key
export const keyOf = (object: object): number => {
  let key = keys.get(object);

  if (key === undefined) {
    key = keysSerial.next();
    keys.set(object, key);
  }

  return key;
};
