import debounceFn from 'lodash.debounce';

// Debounces arrow functions
export { debounceFn };

interface Options {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export function debounce(milliseconds: number = 0, options: Options = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const map = new WeakMap();
    const originalMethod = descriptor.value;
    descriptor.value = function (...params: any[]) {
      let debounced = map.get(this);
      if (!debounced) {
        debounced = debounceFn(originalMethod, milliseconds, options).bind(this);
        map.set(this, debounced);
      }
      debounced(...params);
    };
    return descriptor;
  }
}