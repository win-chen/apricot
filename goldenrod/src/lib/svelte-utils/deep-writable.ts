import { writable, type Writable } from 'svelte/store';

type WritableArray<T> = Writable<T[]>;

export type DeepWritable<T> = {
  [P in keyof T]: T[P] extends Function ? never : // Exclude functions
    T[P] extends Array<infer U> ? WritableArray<U> : // Handle arrays
    T[P] extends object ? DeepWritable<T[P]> : // Recurse for objects
    Writable<T[P]>; // Handle primitives
};

// TODO: Make sure that the writables unsubscribe correctly
export function deepWritable<T extends Record<string, any>>(obj: T): DeepWritable<T> {
    if (typeof obj !== 'object' || obj === null) {
      throw new Error('Input must be a non-null object');
    }
  
    const result: any = {};
  
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
  
        if (typeof value === 'function') {
          throw new Error(`Property '${key}' is a function, which is not a valid store object`);
        } else if (typeof value == 'object' && !Array.isArray(value)) {
            result[key] = deepWritable(value);
        } else {
            result[key] = writable(value);
        }
      }
    }
  
    return result;
  }
  