import { EventEmitter } from "pixi.js";
import svelteFsm from "svelte-fsm";
import { convertToChildState, emitTransitions } from "./util";

export enum DragState {
  DORMANT = 'drag/dormant',
  IDLE = 'drag/idle',
  DRAG_AVAILABLE = 'drag/available',
  DRAGGING = 'drag/dragging',
}

const config = {
  [DragState.IDLE]: {
    dragAvailable: DragState.DRAG_AVAILABLE,
  },
  [DragState.DRAG_AVAILABLE]: {
    startDrag: DragState.DRAGGING,
    dragUnavailable: DragState.IDLE,
  },
  [DragState.DRAGGING]: {
    endDrag: DragState.IDLE,
  }
};

export const dragTransitions = new EventEmitter();

export const dragFsm = svelteFsm(DragState.DORMANT, 
  emitTransitions(
    convertToChildState(config, DragState.DORMANT, DragState.IDLE), 
    dragTransitions)
);
