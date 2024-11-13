import { dragHelpers, type DragHelper } from "src/lib/svelte-utils/drag-helper";
import { get, writable } from "svelte/store";
import { listener, pointerPos, renderFrame } from "../stores";

let panInstance: DragHelper | null = null;

const start = () => {
  const { left, top } = get(renderFrame.originPoint);
  const originPos = writable({
    x: left,
    y: top,
  });

  originPos.subscribe((val) => {
    renderFrame.originPoint.set({
      left: val.x,
      top: val.y,
    });
  });

  panInstance = dragHelpers(originPos, pointerPos, get(renderFrame.scale));

  get(listener)?.addEventListener(
    "globalpointermove",
    panInstance?.update as EventListenerOrEventListenerObject
  );
  panInstance.start();
};

const end = () => {
  get(listener)?.removeEventListener(
    "globalpointermove",
    panInstance?.update as EventListenerOrEventListenerObject
  );
  panInstance?.end();
};

export const panCanvas = {
  start,
  end,
};
