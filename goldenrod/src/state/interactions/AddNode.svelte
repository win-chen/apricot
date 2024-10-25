<script lang="ts">
  import { createAddNodeInstance } from "../actions_internal.ts/add-node";
  import { rootFsmTransitions } from "../fsms/root-fsm";
  import type { Container } from "pixi.js";
  import type { RelativeRenderFrame } from "src/lib/svelte-utils/svelte-infinite-canvas/relative-render";
  import { InteractionState } from "../fsms/types";

  export let listener: Container;
  // TODO: make this a writable x, y of new node position
  export let renderFrame: RelativeRenderFrame;

  const addNodeInstance = createAddNodeInstance(renderFrame);

  rootFsmTransitions.on(`${InteractionState.ADD_NODE}:enter`, () => {
    listener.on("pointerdown", addNodeInstance.addNodeOnClick);
  });
  rootFsmTransitions.on(`${InteractionState.ADD_NODE}:exit`, () => {
    listener.off("pointerdown", addNodeInstance.addNodeOnClick);
  });
</script>
