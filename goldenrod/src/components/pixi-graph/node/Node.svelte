<script lang="ts">
  import BasicCard from "src/components/pixi-svelte/BasicCard.svelte";
  import TextDiv from "src/components/pixi-svelte/TextDiv.svelte";
  import type { Container } from "pixi.js";
  import { hoveredNodeId } from "src/state/state";
  import { onMount } from "svelte";
  import type { PixiNode } from "src/state/types";

  export let node: PixiNode;
  let card: Container;

  $: ({ text } = node.attr);
  $: ({ position, color, opacity } = node.ui);
  $: ({ top, left } = $position);
  $: ({ surfaceColor, isSelected } = node.derived);

  const handleMouseover = () => {
    hoveredNodeId.set(node.id);
  };
  const handleMouseout = () => {
    hoveredNodeId.set(undefined);
  };

  onMount(() => {
    // Set dimensions so that infinite canvas will know whether or not to render
    const { width, height } = card;
    node.ui.dimensions.set({ width, height });
  });
</script>

<BasicCard
  bind:card
  on:mouseover={handleMouseover}
  on:mouseout={handleMouseout}
  x={left}
  y={top}
  selected={$isSelected}
  color={$color || $surfaceColor}
  opacity={$opacity}
>
  <TextDiv text={$text}></TextDiv>
</BasicCard>
