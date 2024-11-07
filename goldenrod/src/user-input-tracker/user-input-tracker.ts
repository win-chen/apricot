import { Graph } from "@dagrejs/graphlib";

import {
  type Readable,
  derived,
  writable,
  type Writable,
  readable,
  get,
} from "svelte/store";
import { type AvailableInputs, type Config, type ConfigList } from "./types";
import microdiff from "microdiff";
import {
  DELIMITER,
  deletePathFromSearchTree,
  getNonPathPredecessors,
  writePathTrie,
} from "./path-trie";
import { bubble } from "./path-trie";
import { isBooleanWritable } from "./utils";

export const ROOT = "_";

const getStore = (graph: Graph, action: string) => {
  const value = graph.node(action);

  if (!isBooleanWritable(value)) {
    throw new Error(
      `Action node named "${action}" is malformed. Node value of ${value} is not a Writable<KeyboardEvent>.`
    );
  }
  return value;
};

/**
 * Usage assuming "button_is_pressed" custom input has been set up:
 * const config = {
 *  "highlight_button": { input: [not("button_is_pressed")]}
 * }
 * This will run "highlight_button" when the "button_is_pressed" input is FALSE
 * @param inputName - custom input name
 * @returns input name
 */
export const not = (inputName: string) => `not:${inputName}`;

// Input sequences can contain "not:input" or "input" relating to the same input. This function returns the referenced input
const referencedInput = (inputName: string) => {
  const tokens = inputName.split(":");
  return tokens.length === 1 ? inputName : tokens[1];
};

/**
 * Convenience function is used to create unordered subsequences in input sequences for configs
 * Usage:
 * // Create a narrowly typed unordered function
 * const unordered = gUnordered<YourCustomInputsObj>
 * // In your configs
 * inputs: ["A", unordered("B", "C")]
 * @param args a list of inputs
 * @returns a representation of "unordered" inputs
 */
export const gUnordered = <T extends Record<string, any>>(
  ...args: AvailableInputs<T>[]
) => {
  return args.sort();
};

/**
 *
 * @param customInputs A record of { [inputName]: store }. The store activates the input when it is truthy
 * @returns
 */
export const userInteractionTracker = <T extends Record<string, any>>(
  customInputs: T
) => {
  const inputTrie = new Graph({ compound: true, directed: true });
  const activeLeaves = new Set<string>(ROOT);
  // Currently registered configs
  let actionConfigs: ConfigList<T> = {};

  const registerAction = <T extends Record<string, any>>(
    name: string,
    config: Config<T>
  ) => {
    const { input } = config;

    if (input.flat().includes(ROOT)) {
      throw new Error(`Invalid input name, "_" is a reserved word.`);
    }

    const activator = writable(false);
    inputTrie.setNode(name, activator);

    const leaves = writePathTrie(inputTrie, input, ROOT);

    leaves.forEach((leaf) => inputTrie.setEdge(name, leaf));

    debugger;
    // Activate any custom inputs
    input
      .flat()
      .filter((name) => customInputs[referencedInput(name)])
      .forEach((name) => {
        const input = referencedInput(name);

        customInputs[input].subscribe((val: any) => {
          if (!!val) {
            activateInput(input);
            deactivateInput(`not:${input}`);
          } else {
            activateInput(`not:${input}`);
            deactivateInput(input);
          }
        });
      });
  };

  const deregisterAction = (action: string) => {
    const paths = inputTrie.children(action) || [];
    paths.forEach((path) => deletePathFromSearchTree(inputTrie, path));
  };

  const activateInput = (input: string, event?: MouseEvent): boolean => {
    let activatedAnAction = false;
    debugger;

    const activate = (pathNode: string) => {
      debugger;
      const childPath = `${pathNode}${DELIMITER}${input}`;

      if ((inputTrie.successors(pathNode) || []).includes(childPath)) {
        // Move leaf marker to child
        activeLeaves.add(childPath);
        activeLeaves.delete(pathNode);
        // Activate actions on the activated path

        activatedAnAction = triggerAnyActionsOnThisNode(childPath, true, event);
      }
    };

    // Check each pathNode on currently active branches to find all new activated pathNodes
    [...activeLeaves].forEach((pathNode) => {
      bubble(inputTrie, pathNode, activate, ROOT);
    });

    return activatedAnAction;
  };

  const triggerAnyActionsOnThisNode = (
    pathNode: string,
    active: boolean,
    event?: MouseEvent
  ) => {
    let triggeredAnAction = false;

    const actions = getNonPathPredecessors(inputTrie, pathNode);

    actions.forEach((action) => {
      const store = getStore(inputTrie, action);
      const wasActive = get(store);
      store.set(active);
      const { onEnter, onLeave } = actionConfigs[action];

      if (onEnter && !wasActive && active) {
        triggeredAnAction = true;
        onEnter(event);
      } else if (onLeave && wasActive && !active) {
        triggeredAnAction = true;
        onLeave(event);
      }
    });
    return triggeredAnAction;
  };

  const deactivateInput = (input: string, event?: MouseEvent) => {
    let deactivatedAnAction = false;
    [...activeLeaves].forEach((leaf) => {
      const path = leaf.split(DELIMITER);
      const index = path.indexOf(input);
      if (index == -1) {
        return; // skip
      }

      // Index should never be 0 because that is root
      const startNode = path.slice(0, index - 1).join(DELIMITER);
      activeLeaves.add(startNode);
      activeLeaves.delete(leaf);

      const deactivate = (pathNode: string) => {
        deactivatedAnAction = triggerAnyActionsOnThisNode(
          pathNode,
          false,
          event
        );
      };

      bubble(inputTrie, leaf, deactivate, startNode);
    });
    return deactivatedAnAction;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    // const key = getUnshiftedKey(event.key) as Key;
    const key = event.key;
    const activated = activateInput(key);

    // Prevent default of a shortcut has been activated
    if (activated) {
      event.preventDefault();
    }
  };
  const onKeyUp = (event: KeyboardEvent) => {
    // const key = getUnshiftedKey(event.key) as Key;
    const key = event.key;
    deactivateInput(key);
  };

  // TODO: also support click events
  const onMouseDown = (event: MouseEvent) => {
    const activated = activateInput("CLICK", event);
    // Prevent default of a shortcut has been activated
    if (activated) {
      event.preventDefault();
    }
  };

  const onMouseUp = (event: MouseEvent) => {
    deactivateInput("CLICK", event);
  };

  return {
    inputTrie,
    activeLeaves,
    /**
     * Add event listeners
     * @param document
     */
    init: (document: Document) => {
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mouseup", onMouseUp);
    },
    /**
     * Clean up event listeners
     * @param document
     */
    destroy: (document: Document) => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);

      // store subscriptions are automatically cleaned up
    },
    register: (config: ConfigList<T>) => {
      const prevConfig = actionConfigs;

      const diff = microdiff(prevConfig, config, { cyclesFix: false });
      diff.forEach(({ type, path }) => {
        // Validate config list
        // Name is always at 0 because Config is a single level mapping
        if (path.length > 1 || typeof path[0] !== "string") {
          throw new Error(
            "Config may be malformed. Should be a non-nested record with string values"
          );
        }
        const actionName = path[0];
        switch (type) {
          case "CHANGE":
            throw new Error("Updating config list is not yet supported.");
          case "CREATE":
            registerAction(actionName, config[actionName]);
          case "REMOVE":
            deregisterAction(actionName);
        }
      });

      actionConfigs = config;
    },
    actionStore: (actionName: string) => {
      const node = inputTrie.node(actionName);
      if (!node) {
        throw new Error(`No action "${actionName} found`);
      }
      cachedReadable(node.value);
    },
    actionsConfig: actionConfigs,
  };
};

// TODO: need to garbage collect?
const readableCache = new Map<Writable<any>, Readable<any>>();
const cachedReadable = (store: Writable<any>): Readable<any> => {
  if (readableCache.has(store)) {
    return readableCache.get(store)!;
  }
  const result = readable(store);
  readableCache.set(store, result);
  return result;
};
