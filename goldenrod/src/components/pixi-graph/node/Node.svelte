<script lang="ts">
  import type { Container } from "pixi.js";
  import BasicCard from "src/components/pixi-svelte/BasicCard.svelte";
  import TextDiv from "src/components/pixi-svelte/TextDiv.svelte";
  import { hoveredNodeId } from "src/state/state/index";
  import type { PixiNode } from "src/state/types";
  import { onMount } from "svelte";

  export let node: PixiNode;
  let card: Container;

  $: ({ text } = node.attr);
  $: ({ position, color, opacity } = node.ui);
  $: ({ top, left } = $position);
  $: ({ surfaceColor, isSelected, isHovered } = node.derived);

  // TODO: learn how to bind hoveredNodeId on some hover event on BasicCard
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
  hovered={$isHovered}
  color={$color || $surfaceColor}
  opacity={$opacity}
>
  <TextDiv text={$text}></TextDiv>
</BasicCard>
