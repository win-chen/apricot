import { dragHelpers, type DragHelper } from "src/lib/svelte-utils/drag-helper";
import { get, writable, type Writable } from "svelte/store";
import type { RelativeRenderFrame } from "src/lib/svelte-utils/svelte-infinite-canvas/relative-render";
import type { Container } from "pixi.js";

export const createPan = (pointerPos: Writable<{x: number, y: number}>, scalerContainer: Container, renderFrame: RelativeRenderFrame) => {
  let helper: DragHelper | undefined;
  const start = () => {
    const { left, top } = get(renderFrame.originPoint);
    const originPos = writable({
      x: left,
      y: top
    });

    originPos.subscribe((val) => {
      renderFrame.originPoint.set({
        left: val.x,
        top: val.y
      });
    });

    helper = dragHelpers(originPos, pointerPos, scalerContainer);

    helper.start();
  }

  const doPan = () => {
    helper?.update();
  }

  const end = () => {
    helper?.end();
  }

  return {
    start,
    doPan,
    end
  }

}