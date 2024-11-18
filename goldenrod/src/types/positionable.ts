import { writable, type Writable } from "svelte/store";

export interface Positionable {
  position: Writable<{ x: number; y: number }>;
  dimensions: Writable<{ width: number; height: number }>;
}
export const defaultPositionable = (): Positionable => ({
  position: writable({ x: 0, y: 0, init: false }),
  dimensions: writable({ width: 0, height: 0, init: false }),
});
