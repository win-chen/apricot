import { EventEmitter } from "pixi.js";
import svelteFsm from "svelte-fsm";
import { convertToChildState, emitTransitions } from "./util";

export enum AddEdgeState {
  DORMANT = 'add_edge/dormant',
  IDLE = 'add_edge/idle',
  HOVERING_SOURCE = 'add_edge/hovering_src',
  SOURCE_SELECTED = 'add_edge/src_selected',
  HOVERING_DEST = 'add_edge/hovering_dest',
}

const config = {
  [AddEdgeState.IDLE]: {
    hoverSrc: AddEdgeState.HOVERING_SOURCE,
  },
  [AddEdgeState.HOVERING_SOURCE]: {
    selectComplete: AddEdgeState.HOVERING_DEST,
    unhover: AddEdgeState.IDLE,
  },
  [AddEdgeState.SOURCE_SELECTED]: {
    hoverDest: AddEdgeState.HOVERING_SOURCE,
    cancelSelections: AddEdgeState.IDLE,
  },
  [AddEdgeState.HOVERING_DEST]: {
    unhover: AddEdgeState.SOURCE_SELECTED,
    selectComplete: AddEdgeState.IDLE,
  }
};

export const addEdgeTransitions = new EventEmitter();

export const addEdgeFsm = svelteFsm(AddEdgeState.DORMANT, 
  emitTransitions(
    convertToChildState(config, AddEdgeState.DORMANT, AddEdgeState.IDLE), 
    addEdgeTransitions)
);
