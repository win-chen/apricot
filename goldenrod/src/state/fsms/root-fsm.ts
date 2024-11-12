import { EventEmitter } from "pixi.js";
import {
  keyboardInput,
  liftEvent,
  pressEvent,
} from "src/components/keyboard-ctrl/keyboard-input";
import svelteFsm from "svelte-fsm";
import { get } from "svelte/store";
import { hoveredNodeId } from "../state/ui";
import { addEdgeFsm } from "./add-edge-fsm";
import { dragFsm } from "./drag-fsm";
import { panFsm } from "./pan-canvas-fsm";
import {
  FsmConfigOption,
  InteractionState,
  RootInteractionState,
  fsmConfig,
  type RootStateEnum,
} from "./types";
import { connectChildFsms, emitTransitions, type ChildFsm } from "./util";

/**
 * State is active until another state's key is pressed
 * @returns svelte-fsm config
 */
const defaultStateConfig = () => ({
  _enter() {
    Object.values(InteractionState).forEach((state) =>
      keyboardInput.events.on(pressEvent(state), () => {
        switch (fsmConfig[state]) {
          case FsmConfigOption.ON_PRESS_OVER_NODE:
            // Don't switch states unless hovered node is available
            if (!get(hoveredNodeId)) {
              return;
            }
            break;
        }

        rootFsm.mode(state);
      })
    );
  },
  _exit() {
    keyboardInput.events.removeAllListeners();
  },
});

/**
 * State is active as long as shortcut is held
 * @param stateName
 * @returns svelte-fsm config
 */
const holdStateConfig = (stateName: string) => ({
  _enter() {
    // If any shortcut is activated, switch modes
    keyboardInput.events.on(liftEvent(stateName), () => {
      rootFsm.defaultState();
    });
  },
});

/**
 *
 * @returns a svelte-fsm config that exposes a mode method which
 * can be used to switch into any other root state
 */
const createBaseState = () => ({
  defaultState() {
    return InteractionState.SELECT;
  },
  mode(rootState: InteractionState) {
    return rootState;
  },
});

const baseConfig = Object.values(RootInteractionState).reduce(
  (acc, stateName) => {
    let stateConfig = {};
    switch (fsmConfig[stateName]) {
      case FsmConfigOption.DEFAULT:
        stateConfig = defaultStateConfig();
        break;
      case FsmConfigOption.ON_HOLD:
        stateConfig = holdStateConfig(stateName);
        break;
    }
    acc[stateName] = { ...createBaseState(), ...stateConfig };
    return acc;
  },
  {} as Record<RootStateEnum, ReturnType<typeof createBaseState>>
);

// Mapping of root state to it's child state, if any
const childFsmMapping: Partial<Record<InteractionState, ChildFsm>> = {
  [InteractionState.DRAG_NODE]: dragFsm,
  [InteractionState.ADD_EDGE]: addEdgeFsm,
  [InteractionState.PAN]: panFsm,
};

export const rootFsmTransitions = new EventEmitter();

export const rootFsm = svelteFsm(
  RootInteractionState.UNINITIALIZED,
  emitTransitions(
    connectChildFsms(baseConfig, childFsmMapping),
    rootFsmTransitions
  )
);
