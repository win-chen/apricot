<script lang="ts">
  import { Container, Rectangle, type Renderer } from "pixi.js";
  import { Application } from "pixi.js";
  import { backgroundColor } from "src/config/colors";
  import { handleError } from "src/lib/error-handler";
  import { onMount } from "svelte";
  import {
    setContainer,
    setInteractionCanvas,
    setContentContainer,
    setListenerContainer,
    setCanvasScale,
  } from "./context";
    import { writable, type Writable } from "svelte/store";

  /** Props */
  export let width: number;
  export let height: number;
  export let top: number;
  export let left: number;

  /** Component */
  let container: HTMLDivElement;
  let app: Application<Renderer<HTMLCanvasElement>>;
  // Scale of the canvas, number between 0 to 1
  const canvasScale = writable(0);

  // Provides hitarea
  const interactionCanvas = new Container();
  interactionCanvas.eventMode = "static";
  setInteractionCanvas(interactionCanvas);

  // Used to scale
  const contentContainer = new Container();
  contentContainer.eventMode = "static";
  setContainer(contentContainer);
  setContentContainer(contentContainer);
  // init canvas scale
  canvasScale.set(contentContainer.scale.x);
  contentContainer.on("custom-scale", () => canvasScale.set(contentContainer.scale.x));
  setCanvasScale(canvasScale);

  // Listens to events from both containers 
  const listenerContainer = new Container();
  listenerContainer.eventMode = "static";
  setListenerContainer(listenerContainer);
  listenerContainer.addChild(interactionCanvas);
  listenerContainer.addChild(contentContainer);

  // Resize based on width and height
  $: {
    interactionCanvas.width = width;
    interactionCanvas.height = height;
    interactionCanvas.hitArea = new Rectangle(0, 0, width, height);
    app?.renderer?.resize(width, height);
  }


  onMount(async () => {
    app = new Application<Renderer<HTMLCanvasElement>>();
    
    // debug
    // @ts-ignore
    globalThis.__PIXI_APP__ = app;
    
    try {
      await app.init({
        width,
        height,
        backgroundColor,
        antialias: true,
      });

      container.appendChild(app.canvas);
      app.stage.addChild(listenerContainer);
    } catch (error) {
      handleError(error, "Error initializing pixi js container.");
    }
  });
</script>

<div
  bind:this={container}
  class="canvas-container"
  style:top={`${top}px`}
  style:left={`${left}px`}
>
  <slot></slot>
</div>

<style>
  .canvas-container {
    position: absolute;
  }
  * {
    margin: 0;
  }
</style>
