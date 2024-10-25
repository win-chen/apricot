// TODO: Deprecate when Pointer.svelte is deprecated

import { derived, type Readable } from "svelte/store";

// Convenience function used to check if any of the stored booleans have changed
// or if all of the boolean values are false.
export const boolSubscriber = (stores: Array<Readable<boolean>>) => {
  const subscriber = {
    any: (cb: (val: boolean, index: number) => any) => {
      stores.forEach((store, index) => 
        store.subscribe((val) => cb(val, index)))
      return subscriber;
    },
    allFalse: (cb: Function) => {
      const isAllFalse = derived(stores, ($stores) =>
        $stores.every(val => !val));
      isAllFalse.subscribe((val) => val && cb());
      return subscriber;
    }
  }

  return subscriber;
}
