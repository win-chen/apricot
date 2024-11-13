<script lang="ts" context="module">
  const initPixiEdge = (parent: Container) => {
    const container = new Container();
    container.interactive = true;
    parent.addChild(container);
    return container;
  };
</script>

<script lang="ts">
  import { Container, Graphics } from "pixi.js";
  import { type PixiEdge } from "src/state/stores/types";
  import { getContainer } from "src/components/pixi-svelte/context";
  import { onDestroy } from "svelte";

  export let edge: PixiEdge;
  const container = getContainer();

  $: ({ src, dest, opacity } = edge);

  const pixiEdge = initPixiEdge(container);
  const graphic = new Graphics();
  pixiEdge.addChild(graphic);

  $: {
    const sX = $src.left;
    const sY = $src.top;
    const tX = $dest.left;
    const tY = $dest.top;

    graphic.clear();
    graphic.moveTo(sX, sY);
    graphic.lineTo(tX, tY);
    graphic.stroke({ color: edge.color, width: 2, alpha: $opacity });

    const midX = (sX + tX) / 2;
    const midY = (sY + tY) / 2;
    const angle = Math.atan2(tY - sY, tX - sX);
    graphic.moveTo(midX, midY);
    graphic.lineTo(
      midX - 10 * Math.cos(angle + Math.PI / 6),
      midY - 10 * Math.sin(angle + Math.PI / 6),
    );
    graphic.lineTo(
      midX - 10 * Math.cos(angle - Math.PI / 6),
      midY - 10 * Math.sin(angle - Math.PI / 6),
    );

    graphic.lineTo(midX, midY);
    graphic.fill({ color: edge.color, alpha: $opacity });
    graphic.stroke({ color: edge.color, width: 2, alpha: $opacity });
  }

  /** Lifecycle ==== */
  onDestroy(() => {
    pixiEdge.destroy({ children: true });
  });
</script>
