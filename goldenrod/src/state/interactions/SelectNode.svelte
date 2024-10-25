<script lang="ts">
  import { rootFsmTransitions } from "../fsms/root-fsm";
  import type { Container } from "pixi.js";
  import { InteractionState } from "../fsms/types";
  import { toggleSelect } from "src/state/actions_internal.ts/select-node";

  export let listener: Container;

  rootFsmTransitions.on(`${InteractionState.SELECT}:enter`, () => {
    listener.on("pointerdown", toggleSelect);
  });
  rootFsmTransitions.on(`${InteractionState.SELECT}:exit`, () => {
    listener.off("pointerdown", toggleSelect);
  });
</script>
