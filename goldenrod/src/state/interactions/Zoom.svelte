<script lang="ts">
    import type { Container } from "pixi.js";
    import { rootFsmTransitions } from "../fsms/root-fsm";
    import { zoomFunctions, zoomIn, zoomOut } from "../actions_internal.ts/zoom";
    import { InteractionState } from "../fsms/types";

    // Container to track scale
    // TODO: Consider replace with store that will be glue to the content container
    export let container: Container;

  const zoomerIn = zoomFunctions(container, zoomIn);
  const zoomerOut = zoomFunctions(container, zoomOut);

  rootFsmTransitions.on(`${InteractionState.ZOOM_IN}:enter`, () => {
    zoomerIn.start();
  });
  rootFsmTransitions.on(`${InteractionState.ZOOM_IN}:exit`, () => {
    zoomerIn.stop();
  });

  rootFsmTransitions.on(`${InteractionState.ZOOM_OUT}:enter`, () => {
    zoomerOut.start();
  });
  rootFsmTransitions.on(`${InteractionState.ZOOM_OUT}:exit`, () => {
    zoomerOut.stop();
  });
</script>