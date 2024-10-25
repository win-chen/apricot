import type { EventEmitter } from "pixi.js";
import { produce } from 'immer';

interface Transitionable {
  _enter?: Function,
  _exit?: Function,
  [key: string]: any; // Allows any additional properties
}

/**
 *
 * @param fsmConfig 
 * @param emitter 
 * @returns new config with _enter and _exit functions that emit
 * events with the name: '$statename:enter' '$statename:exit'
 * e.g. 'loading:enter', 'loading:exit'
 */
export const emitTransitions = <T extends Record<string, Transitionable>>(fsmConfig: T, emitter: EventEmitter): T => {
  const newConfig = produce(fsmConfig, (baseConfig) => {
    for (const prop in baseConfig) {
      const originalEnter = baseConfig[prop]._enter;
      baseConfig[prop]._enter = () => {
        originalEnter && originalEnter();
        emitter.emit(`${prop}:enter`);
      };
      const originalExit = baseConfig[prop]._exit;
      baseConfig[prop]._exit = () => {
        originalExit && originalExit();
        emitter.emit(`${prop}:exit`);
      }
    }
  });
  return newConfig;
}

/**
 * A child fsm must have properly configured enter and exit
 * 'enter' must be callable when dormant
 * 'exit' must be available in all non-dormant states
 * 
 */
export interface ChildFsm {
  enter: Function,
  exit: Function,
  [key: string]: any; // Allows any additional properties
}

type ChildFsmMap = Partial<Record<string, ChildFsm>>;

/**
 * 
 * @param fsmConfig - svelte-fsm config
 * @param childFsmMap - Record<statename in fsmConfig, someFsm>
 * @returns Returns a new config that calls the child fsm's enter or exit function
 */
export const connectChildFsms = <T extends Record<string, Transitionable>>(fsmConfig: T, childFsmMap: ChildFsmMap) => {
  const newConfig = produce(fsmConfig, (baseConfig) => {
    for (const prop in childFsmMap) {
      const childFsm = childFsmMap[prop];
      if (!childFsm) {
        continue;
      }

      const originalEnter = baseConfig[prop]._enter;
      baseConfig[prop]._enter = () => {
        childFsm.enter();
        originalEnter && originalEnter();
      };
      const originalExit = baseConfig[prop]._exit;
      baseConfig[prop]._exit = () => {
        childFsm.exit();
        originalExit && originalExit();
      }
    }
  });
  return newConfig;
}

type AddNestedProp<T, K extends string, V> = {
  [P in keyof T]: T[P] extends object ? T[P] & { [Q in K]: V } : T[P];
};
const addExit = <const T extends object, K extends string>(config: T, dormantState: K): AddNestedProp<T, "exit", string> => {
  let draft = {} as AddNestedProp<T, "exit", string>;

  for (const key of Object.keys(config) as (keyof T)[]) {
    const newValue = {
      ...config[key],
      exit: dormantState
    };

    draft[key] = newValue;
  }

  return draft;
}
const addEnter = <const T extends object, K extends string>(config: T, dormantState: K, initialState: string): T & { [P in K]: { enter: string } } => {
  return {
    ...config,
    [dormantState]: {
      enter: initialState
    }
  } as T & { [P in K]: { enter: string } };
}

/**
* @param config - The fsm state config
* @param dormantState - Name of the dormant state, usually 'someprefix/dormant'
* @param initialState - Name of the initial active state, usually 'someprefix/idle'
* @returns converted state config object used to create an fsm with the
* enter and exit functions expected by all childfsms that are connected via
* connectChildFsms
*/
export const convertToChildState = <const T extends object, K extends string>
  (config: T, dormantState: K, initialState: string) => addEnter(
    addExit(config, dormantState), dormantState, initialState);
