import { get, type Readable, type Writable } from 'svelte/store';

function isStore(value: any): value is Readable<any> | Writable<any> {
  return value && typeof value.subscribe === 'function';
}

// Utility type to infer the unwrapped type of a store
type UnwrapStore<T> = T extends Readable<infer U> ? U : T;

// Recursively unwrap all stores in an object or array
type DeepUnwrap<T> = T extends Readable<any> | Writable<any>
  ? UnwrapStore<T>
  : T extends (infer U)[]
  ? DeepUnwrap<U>[]
  : T extends object
  ? { [K in keyof T]: DeepUnwrap<T[K]> }
  : T;

export function deepUnwrap<T>(obj: T): DeepUnwrap<T> {
  if (isStore(obj)) {
    return deepUnwrap(get(obj)) as DeepUnwrap<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepUnwrap(item)) as unknown as DeepUnwrap<T>;
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = deepUnwrap(obj[key]);
      }
    }
    return result as DeepUnwrap<T>;
  }

  return obj as DeepUnwrap<T>;
}
