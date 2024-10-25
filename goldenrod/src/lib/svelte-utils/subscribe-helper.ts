import type { Readable } from "svelte/store";

type Callback<T> = (key: string, value: T, context: Record<string, any>) => any;

// Convenience functions for stores of type Record
// Use to run callbacks when something is added or removed from the record 
export const subscribeHelper = <T>(store: Readable<Record<string, T>>) => {
  let previousState: Record<string, T> = {};
  const context: Record<string, any> = {};

  let onAddCallback: Callback<T>;
  let onRemoveCallback: Callback<T>;

  const helpers = {
    doOnceOnAdd(callback: Callback<T>) {
      // Track the callback for added keys
      onAddCallback = callback;
      return this;
    },
    
    doOnceOnRemove(callback: Callback<T>) {
      // Track the callback for removed keys
      onRemoveCallback = callback;
      return this;
    },
    
    subscribe() {
      store.subscribe(currentState => {
        const previousKeys = Object.keys(previousState);
        const currentKeys = Object.keys(currentState);

        // Handle added keys
        currentKeys.forEach(key => {
          if (!previousKeys.includes(key)) {
            if (onAddCallback) {
              onAddCallback(key, currentState[key], context);
            }
          }
        });

        // Handle removed keys
        previousKeys.forEach(key => {
          if (!currentKeys.includes(key)) {
            if (onRemoveCallback) {
              onRemoveCallback(key, previousState[key], context);
            }
          }
        });

        // Update previousState for next comparison
        previousState = { ...currentState };
      });
    }
  };

  return helpers;
}
