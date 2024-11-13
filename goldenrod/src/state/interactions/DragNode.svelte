<script lang="ts">
  import type { PixiNode } from "../types";
  import { dragFsm, DragState, dragTransitions } from "../fsms/drag-fsm";
  import { createDragInstance } from "../actions_2.ts/drag-node";
  import { updateNode } from "src/graphql/requests";
  import type { Readable } from "svelte/store";
  import type { Container } from "pixi.js";

  export let hoveredNode: Readable<PixiNode | undefined>;
  export let listener: Container;
  // replace with a scale UI writable
  export let container: Container;

  const dragInstance = createDragInstance(container, hoveredNode);

  hoveredNode.subscribe((val) => {
    val ? dragFsm.dragAvailable() : dragFsm.dragUnavailable();
  });
  dragTransitions.on(`${DragState.IDLE}:enter`, () => {
    $hoveredNode && dragFsm.dragAvailable();
  });

  dragTransitions.on(`${DragState.DRAG_AVAILABLE}:enter`, () => {
    listener.on("pointerdown", dragFsm.startDrag);
  });
  dragTransitions.on(`${DragState.DRAG_AVAILABLE}:exit`, () => {
    listener.off("pointerdown", dragFsm.startDrag);
  });

  dragTransitions.on(`${DragState.DRAGGING}:enter`, () => {
    dragInstance.init();
    listener
      .on("globalpointermove", dragInstance.doDrag)
      .on("pointerup", dragFsm.endDrag);
  });
  dragTransitions.on(`${DragState.DRAGGING}:exit`, () => {
    listener
      .off("globalpointermove", dragInstance.doDrag)
      .off("pointerup", dragFsm.endDrag);

    const draggedId = dragInstance.finish();
    draggedId && updateNode(draggedId);
  });
</script>
