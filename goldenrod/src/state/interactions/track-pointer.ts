import type { FederatedPointerEvent } from "pixi.js";
import { pointerPos } from "../state";

export const trackPointer = (event: FederatedPointerEvent) => {
  pointerPos.set({
    x: event.clientX,
    y: event.clientY
  });
};