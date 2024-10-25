<script lang="ts">
    import { type ShortcutConfig } from "./types";
    import { onMount, onDestroy } from "svelte";
    import { keyboardInput } from "./keyboard-input";

    onMount(() => {
      keyboardInput.mount();
    });
    onDestroy(() => {
      keyboardInput.dismount();
    });

    /** Props ==== */
    export let shortcuts: ShortcutConfig[];

    $: keyboardInput.registerShortcuts(shortcuts);
</script>