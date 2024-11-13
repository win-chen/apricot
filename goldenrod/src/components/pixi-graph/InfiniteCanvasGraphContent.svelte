<script lang="ts">
  import {
    renderedEdges,
    renderedNodes,
    renderFrame,
  } from "src/state/stores/index";
  import PContainer from "../pixi-svelte/PContainer.svelte";
  import Edge from "./Edge.svelte";
  import Node from "./Node.svelte";

  export let width: number;
  export let height: number;

  $: renderFrame.dimensions.set({ width, height });
</script>

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
