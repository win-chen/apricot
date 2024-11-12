export enum InteractionState {
  SELECT = "select",
  ADD_EDGE = "add_edge",
  ADD_NODE = "add_node",
  DRAG_NODE = "drag_node",
  EDITING = "editing_node",
  PAN = "pan",
  ZOOM_IN = "zoom_in",
  ZOOM_OUT = "zoom_out",
}

enum LifeCycleState {
  // This life cycle state is necessary because we want the
  // default state's _enter event to be heard by any listeners.
  // RootFsm is created before listeners are declared, so we
  // make this the default state and switch into the functional
  // default state on parent's onMount
  UNINITIALIZED = "uninitialized",
}

export type RootStateEnum = LifeCycleState | InteractionState;

export const RootInteractionState = {
  ...LifeCycleState,
  ...InteractionState,
} as const;

export enum FsmConfigOption {
  EMPTY,
  DEFAULT,
  ON_HOLD,
  ON_PRESS,
  ON_PRESS_OVER_NODE,
}

export const fsmConfig = {
  [LifeCycleState.UNINITIALIZED]: FsmConfigOption.EMPTY,
  [InteractionState.SELECT]: FsmConfigOption.DEFAULT,
  [InteractionState.ADD_EDGE]: FsmConfigOption.ON_HOLD,
  [InteractionState.ADD_NODE]: FsmConfigOption.ON_HOLD,
  [InteractionState.DRAG_NODE]: FsmConfigOption.ON_HOLD,
  [InteractionState.EDITING]: FsmConfigOption.ON_PRESS_OVER_NODE,
  [InteractionState.PAN]: FsmConfigOption.ON_HOLD, 
  [InteractionState.ZOOM_IN]: FsmConfigOption.ON_HOLD,
  [InteractionState.ZOOM_OUT]: FsmConfigOption.ON_HOLD,
};
