import { Container } from "pixi.js";
import { dragHelpers, type DragHelper } from "src/lib/svelte-utils/drag-helper";
import { get, writable, type Readable } from "svelte/store";
import { pointerPos } from "../state/ui";
import { type PixiNode } from "../types";

export const createDragInstance = (
  // TODO: replace with a scale UI writable
  containerForScale: Container,
  // TODO: replace with writable x, y
  hoveredNode: Readable<PixiNode | undefined>
) => {
  let draggingId: string | undefined = undefined;

  let dragHelper: DragHelper | undefined;

  const init = () => {
    const node = get(hoveredNode);
    if (!node) {
      throw new Error(
        "Hover node not found. Please check dragging fsm for errors"
      );
    }

    const attr = node.attr;

    const nodePos = writable({
      x: get(attr.x),
      y: get(attr.y),
    });

    nodePos.subscribe((val) => {
      attr.x.set(val.x);
      attr.y.set(val.y);
    });

    dragHelper = dragHelpers(nodePos, pointerPos, containerForScale);

    draggingId = attr.id;
    dragHelper.start();
  };

  const doDrag = () => {
    dragHelper?.update();
  };

  const finish = () => {
    const draggedId = draggingId;
    draggingId = undefined;

    dragHelper?.end();

    return draggedId;
  };

  return {
    init,
    doDrag,
    finish,
  };
};
