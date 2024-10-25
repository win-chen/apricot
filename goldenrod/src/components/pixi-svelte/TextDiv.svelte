<script lang="ts">
  import type { Container } from "pixi.js";
  import { getCanvasScale, getContainer } from "./context";
  export let text: string;
  let top: string;
  let left: string;
  let width: string;
  let height: string;
  let transform: string;

  const canvasScale = getCanvasScale();
  const container = getContainer();

  // TODO: Currently "custom-transform" is only emitted in BasicCard
  // Also emit on size change
  const updatePosition = () => {
    if (container.destroyed == true) {
      // container has been removed
      return;
    }

    const { x, y, width: cW, height: cH } = container.getBounds();

    top = `${y}px`;
    left = `${x}px`;
    width = `${cW}px`;
    height = `${cH}px`;
  };

  const updateScale = (scale: number) => {
    transform = `scale(${scale}`;
    updatePosition();
  }
  canvasScale.subscribe(updateScale);
  updatePosition();
  container.on("custom-transform", updatePosition);

</script>

<div style:left style:top style:width style:height style:transform>
  <p>{text}</p>
</div>

<style>
  div {
    pointer-events: none;
    position: absolute;
    align-content: center;
    text-align: center;
  }

  p {
    user-select: none;
    overflow: hidden;
    text-overflow: ellipsis;
    color: black;
    font-family: monospace;
  }
</style>
