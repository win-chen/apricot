import { writable, type Writable } from "svelte/store";

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Rectangle extends Position, Dimensions {}

export interface Positionable {
  position: Writable<Position>;
  dimensions: Writable<Dimensions>;
}
export const defaultPositionable = (): Positionable => ({
  position: writable({ x: 0, y: 0, init: false }),
  dimensions: writable({ width: 0, height: 0, init: false }),
});
