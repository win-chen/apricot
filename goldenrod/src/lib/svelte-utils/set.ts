import { writable } from 'svelte/store';

export enum SetAction {
  ADDED,
  DELETED,
};

function deleteInPlace<T>(arr: Array<T>, item: T) {
  const index = arr.indexOf(item); // Find the index of the item
  if (index !== -1) {
    arr.splice(index, 1); // Remove the item if it exists
  }
}

export function writableSet<T>(arr: Array<T>) {
  const { subscribe, update } = writable(arr);

  return {
    subscribe,
    add: (item: T) => {
      if (!arr.includes(item)) {
        update(() => {
          arr.push(item);
          return arr;
        });
        return SetAction.ADDED;
      }
    },
    delete: (item: T) => {
      if (arr.includes(item)) {
        update(() => {
          deleteInPlace(arr, item);
          return arr;
        });
        return SetAction.DELETED;
      }
    },
    toggle: (item: T) => {
      const hasItem = arr.includes(item);
      update(() => {
        hasItem ? 
          deleteInPlace(arr, item) : 
          arr.push(item);
        return arr;
      });
      return hasItem ? SetAction.DELETED : SetAction.ADDED;

    },
    clear: () => update(() => {
      arr.length = 0;
      return arr;
    }),
  };
}

export type SetStore<T> = ReturnType<typeof writableSet<T>>;

export function withSubscribableActions<T>(store: SetStore<T>) {
  let onAdd = (item: T) => { };
  let onDelete = (item: T) => { };
  let onClear = () => { };

  return {
    subscribe: store.subscribe,
    add: (item: T) => {
      const action = store.add(item);
      if (action == SetAction.ADDED) {
        onAdd(item);
      }
      return action;
    },
    delete: (item: T) => {
      const action = store.delete(item);
      if (action == SetAction.DELETED) {
        onDelete(item);
      }
      return action;
    },
    toggle: (item: T) => {
      const action = store.toggle(item);
      switch (action) {
        case SetAction.ADDED:
          onAdd(item);
          break;
        case SetAction.DELETED:
          onDelete(item);
          break;
      }
      return action;
    },
    clear: () => {
      store.clear();
      onClear();
    },
    onAdd: (fn: (item: T) => void) => {
      onAdd = fn;
    },
    onDelete: (fn: (item: T) => void) => {
      onDelete = fn;
    },
    onClear: (fn: () => void) => {
      onClear = fn;
    },
  }
}
