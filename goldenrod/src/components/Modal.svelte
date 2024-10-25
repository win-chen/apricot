<script lang="ts">
  import { onMount, setContext } from "svelte";

  export let showModal: boolean;
  export let closeOnEnter: boolean = true;
  export let top = "40%";
  export let left = "40%";
  export let onClose: Function = () => {};

  let dialog: HTMLDialogElement;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (closeOnEnter && event.key === "Enter") {
      dialog.close();
    }
  };

  onMount(() => {
    dialog.addEventListener("keydown", handleKeyDown);
  });

  $: if (dialog && showModal) dialog.showModal();

  const handleClose = () => {
    showModal = false;
    onClose();
  }

</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
  style:top
  style:left
  bind:this={dialog}
  on:close={handleClose}
  on:click|self={() => dialog.close()}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div on:click|stopPropagation>
    <slot />
  </div>
</dialog>

<style>
  dialog {
    max-width: 32em;
    border-radius: 0.2em;
    border: none;
    padding: 0;

    position: fixed;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }
  dialog > div {
    padding: 1em;
  }
  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
