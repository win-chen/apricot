<script lang="ts">
  import PContainer from "../../pixi-svelte/PContainer.svelte";
  import Node from "../node/Node.svelte";
  import Edge from "../edge/Edge.svelte";
  import { getContentContainer } from "src/components/pixi-svelte/context";
  import { renderedEdges, renderedNodes } from "src/state/state";
  import InteractionManager from "src/state/interactions/InteractionManager.svelte";
  import { renderFrame } from "src/state/state";

  export let width: number;
  export let height: number;

  $: renderFrame.dimensions.set({ width, height });
  const contentContainer = getContentContainer();
  contentContainer.on("custom-scale", (scale) => {
    renderFrame.scale.set(scale);
  });
</script>

<InteractionManager></InteractionManager>

<div class="container" style:width={`${width}px`} style:height={`${height}px`}>
  <!-- Edges must be in container below Nodes -->
  <PContainer>
    {#each $renderedEdges as edge (edge.id)}
      <Edge {edge}></Edge>
    {/each}
  </PContainer>
  <PContainer>
    {#each $renderedNodes as node (node.id)}
      <Node {node}></Node>
    {/each}
  </PContainer>
</div>

<style>
  .container {
    pointer-events: none;
    position: absolute;
    overflow: hidden;
  }
</style>
