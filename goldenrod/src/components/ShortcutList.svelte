<script lang="ts">
  import { defaultShortcuts } from "src/config/shortcuts";
  import { keyboardInput } from "./keyboard-ctrl/keyboard-input";

  let list: Array<{ name: string; keys: string; active: boolean }> = [];

  keyboardInput.activeShortcuts.subscribe(
    (shortcuts) =>
      (list = defaultShortcuts.map(({ name, keys }) => ({
        name: name.toLocaleLowerCase(),
        keys: keys.join(","),
        active: shortcuts.includes(name),
      }))),
  );
</script>

<div>
  <p>shortcuts</p>
  {#each list as { name, keys, active }}
    <p class:active>{name} - Keys: {keys}</p>
  {/each}
</div>

<style>
  p.active {
    color: blue;
  }
</style>
