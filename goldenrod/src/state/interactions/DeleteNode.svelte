<script lang="ts">
  import { rootFsmTransitions } from "../fsms/root-fsm";
  import { InteractionState } from "../fsms/types";
  import { Key } from "src/components/keyboard-ctrl/types";
  import {
    keyboardInput,
    pressEvent,
  } from "src/components/keyboard-ctrl/keyboard-input";
  import { deleteSelectedNodes } from "src/state/actions_2.ts/delete-selection";

  rootFsmTransitions.on(`${InteractionState.SELECT}:enter`, () => {
    keyboardInput.events.on(pressEvent(Key.BACKSPACE), deleteSelectedNodes);
  });
  rootFsmTransitions.on(`${InteractionState.SELECT}:exit`, () => {
    keyboardInput.events.off(pressEvent(Key.BACKSPACE), deleteSelectedNodes);
  });
</script>
