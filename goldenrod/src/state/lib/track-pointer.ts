import type { FederatedPointerEvent } from "pixi.js";
import { pointerPos } from "../stores/ui";

export const trackPointer = (event: FederatedPointerEvent) => {
  pointerPos.set({
    x: event.clientX,
    y: event.clientY,
  });
};
