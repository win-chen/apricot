<script lang="ts">
  import Modal from "src/components/Modal.svelte";
  import { updateNode } from "src/graphql/requests";
  import { closeEditor } from "src/state/actions_internal.ts/open-editor";
  import { getContentContainer } from "./pixi-svelte/context";
  import { graph } from "src/state/state";

  export let id: string;

  const contentContainer = getContentContainer();

  let output = "";

  $: nodes = graph.nodes;
  $: nodeStore = $nodes[id];

  $: ({ text } = nodeStore.attr);
  $: ({ position } = nodeStore.ui);
  $: ({ top, left } = $position);

  $: output = $text;
  // TODO: Autofocus

  const handleEditorClose = () => {
    text.set(output);
    updateNode(id);
    closeEditor();
  };
</script>

<Modal
  top={`${top * contentContainer.scale.x}px`}
  left={`${left * contentContainer.scale.x}px`}
  showModal
  onClose={handleEditorClose}
  closeOnEnter
>
  <input type="text" bind:value={output} />
</Modal>
