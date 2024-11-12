<script lang="ts">
  import type { Container } from "pixi.js";
  import { createAddEdgeInstance } from "../actions_internal.ts/add-edge";
  import {
    addEdgeFsm,
    AddEdgeState,
    addEdgeTransitions,
  } from "../fsms/add-edge-fsm";
  import { proposedEdgeDest, proposedEdgeSrc } from "../state/add-edge";
  import { hoveredNodeId } from "../state/ui";

  export let listener: Container;

  // instantiate with writable hoveredNodeId
  const addEdgeInstance = createAddEdgeInstance(
    hoveredNodeId,
    proposedEdgeSrc,
    proposedEdgeDest,
  );

  $: proposedEdgeSrc.subscribe((val) => {
    console.log("src", val);
  });
  $: proposedEdgeDest.subscribe((val) => {
    console.log("dest", val);
  });

  hoveredNodeId.subscribe((id) => {
    // Hover src if available
    addEdgeFsm.hoverSrc();

    // Hover dest if available
    if (id !== $proposedEdgeSrc) {
      addEdgeFsm.hoverDest();
    }
  });
  addEdgeTransitions.on(`${AddEdgeState.IDLE}:enter`, () => {
    $hoveredNodeId && addEdgeFsm.hoverSrc();
  });

  addEdgeTransitions.on(`${AddEdgeState.HOVERING_SOURCE}:enter`, () => {
    listener.on("pointerdown", addEdgeInstance.selectSrc);
    listener.on("pointerdown", addEdgeFsm.selectComplete);
  });
  addEdgeTransitions.on(`${AddEdgeState.HOVERING_SOURCE}:exit`, () => {
    listener.off("pointerdown", addEdgeInstance.selectSrc);
    listener.off("pointerdown", addEdgeFsm.selectComplete);
  });

  addEdgeTransitions.on(`${AddEdgeState.SOURCE_SELECTED}:enter`, () => {
    listener.on("pointerdown", addEdgeFsm.cancelSelections);
  });
  addEdgeTransitions.on(`${AddEdgeState.SOURCE_SELECTED}:exit`, () => {
    listener.off("pointerdown", addEdgeFsm.cancelSelections);
  });

  addEdgeTransitions.on(`${AddEdgeState.HOVERING_DEST}:enter`, () => {
    listener.on("pointerdown", addEdgeInstance.selectDest);
    listener.on("pointerdown", addEdgeFsm.selectComplete);
  });
  addEdgeTransitions.on(`${AddEdgeState.HOVERING_DEST}:exit`, () => {
    listener.off("pointerdown", addEdgeInstance.selectDest);
    listener.off("pointerdown", addEdgeFsm.selectComplete);
  });

  addEdgeTransitions.on(`${AddEdgeState.DORMANT}:enter`, () => {
    addEdgeInstance.reset();
  });
</script>
