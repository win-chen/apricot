import { EventEmitter } from "pixi.js";
import svelteFsm from "svelte-fsm";
import { convertToChildState, emitTransitions } from "./util";

export enum PanState {
  DORMANT = 'panning/dormant',
  IDLE = 'panning/idle',
  PANNING = 'panning/panning',
}

const config = {
  [PanState.IDLE]: {
    startPanning: PanState.PANNING,
  },
  [PanState.PANNING]: {
    stopPanning: PanState.IDLE,
  },
};

export const panTransitions = new EventEmitter();

export const panFsm = svelteFsm(PanState.DORMANT, 
  emitTransitions(
    convertToChildState(config, PanState.DORMANT, PanState.IDLE), 
    panTransitions)
);
