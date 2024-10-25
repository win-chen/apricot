<script lang="ts">
    import { keyboardInput } from "src/components/keyboard-ctrl/keyboard-input";
  import { rootFsmTransitions } from "../fsms/root-fsm";
  import { InteractionState } from "../fsms/types";
  import { openEditor } from "../actions_internal.ts/open-editor";
 
  rootFsmTransitions.on(`${InteractionState.EDITING}:enter`, () => {
    keyboardInput.enableOnlyShortcuts([]); // disable non-editor related shortcuts
    openEditor();
  });
  rootFsmTransitions.on(`${InteractionState.EDITING}:exit`, () => {
    keyboardInput.enableAllShortcuts(); // re-enable shortcuts
  });
</script>
