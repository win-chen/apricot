import { get, type Writable } from "svelte/store";

interface DoItem { 
  doArgs: any; 
  doFn: Function; 
}

interface UndoItem {
  undoArgs: any; 
  undoFn: Function;
}

type HistoryItem = [DoItem, UndoItem];  ``

export function createUndoRedo(options?: { historyLength?: number }) {
  const historyLength = options?.historyLength || 300;
  const history: HistoryItem[] = [];
  let index = -1;

  const pushUndo = <DoArgs extends any[], DoReturn, UndoArgs, UndoReturn>(
    doArgs: DoArgs,
    doFn: (...args: DoArgs) => DoReturn,
    undoArgs: UndoArgs,
    undoFn: (context: UndoArgs) => UndoReturn
  ) => {
    history.length = index + 1; // clear redo history
    const historyItem: HistoryItem = [
      { doArgs, doFn },
      { undoArgs, undoFn }
    ];
    history.push(historyItem);

    if (history.length > historyLength) {
      history.shift();
    } else {
      index++;
    }
  }

  // TODO: this should be a class because it is basically creating instances.
  // To be used with svelte stores or objects with the same api as svelte stores.
  // Returns a snapshotter that creates an undoRedo history item.
  // start() <-- snapshots the stores on call. This becomes the undo history
  // end() <-- snapshots the stores on call. This becomes the do history
  // Usage:
  // const snapshot = storesSnapshot([store1, store2]);
  // snapshot.start();
  // snapshot.end(); <-- one history item is added to history
  const storesSnapshot = (storesArr: Writable<any>[]) => {
    let originalStates: any[] = [];
    let nextStates = [];

    const updateStates = (states: any[]) => {
      storesArr.forEach((store, index) => {
        store.set(states[index]);
      });
    }

    const start = () => {
      originalStates = storesArr.map(get);
    }

    const end = () => {
      nextStates = storesArr.map(get);
      // push undo expects an array of args
      pushUndo([nextStates], updateStates, originalStates, updateStates);
    }

    return {
      start,
      end
    } 
  }

  /**
   * 
   * @param doFn - original action
   * @param getContext - function to return the arguments to pass into undoFn
   * @param undoFn - action that undoes the original action
   * @returns original action wrapped with undoRedo logic
   */
  const undoable = <Args extends any[], Context, DoReturn, UndoReturn>(
    doFn: (...args: Args) => DoReturn,
    getContext: (...args: Args) => Context,
    undoFn: (context: Context) => UndoReturn,
  ) => {
    return (...args: Args) => {
      // TODO: possibly use rfdc over structuredClone - faster
      const context = structuredClone(getContext(...args));

      pushUndo<Args, DoReturn, Context, UndoReturn>(
        args, doFn, context, undoFn
      );

      return doFn(...args);
    };
  };

  const undo = () => {
    if (index === -1) {
      return;
    }
    const [_, { undoArgs, undoFn }] = history[index];
    index--;
    undoFn(undoArgs);
  };

  const redo = () => {
    if (index === history.length - 1) {
      return;
    }
    index++;
    const [{ doArgs, doFn }] = history[index];
    doFn(...doArgs);
  };

  return { undoable, undo, redo, storesSnapshot };
}
