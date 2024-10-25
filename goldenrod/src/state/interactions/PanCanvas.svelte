<script lang="ts">
  import { pointerPos } from "../state";
  import type { Container } from "pixi.js";
  import { createPan } from "../actions_internal.ts/pan-canvas";
  import { renderFrame } from "../state";
  import { panFsm, PanState, panTransitions } from "../fsms/pan-canvas-fsm";

  // TODO: replace with scale store/state
  export let container: Container;
  export let listener: Container;

  const panCanvas = createPan(pointerPos, container, renderFrame);

  panTransitions.on(`${PanState.IDLE}:enter`, () => {
    listener.on("pointerdown", panCanvas.start);
    listener.on("pointerdown", panFsm.startPanning);
  });
  panTransitions.on(`${PanState.IDLE}:exit`, () => {
    listener.off("pointerdown", panCanvas.start);
    listener.off("pointerdown", panFsm.startPanning);
  });

  panTransitions.on(`${PanState.PANNING}:enter`, () => {
    listener.on("globalpointermove", panCanvas.doPan);
  });
  panTransitions.on(`${PanState.PANNING}:exit`, () => {
    listener.off("globalpointermove", panCanvas.doPan);
  });
</script>
