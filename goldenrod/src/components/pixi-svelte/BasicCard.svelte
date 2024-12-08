<script lang="ts">
  import { Circle, Container, Graphics } from "pixi.js";
  import {
    cardColor,
    hoverColor,
    hoveredAndSelected,
    selectColor,
  } from "src/config/colors";
  import { forwardEvents } from "src/lib/svelte-utils/forward-event";
  import { onDestroy } from "svelte";
  import { getContainer, setContainer } from "./context";

  export let x: number;
  export let y: number;
  export let drawHitArea = () => new Circle(0, 0, 40);
  export let color = cardColor;
  export let opacity = 1;

  export let selected = false;
  export let hovered = false;

  const parent = getContainer();
  export const card = new Container();
  const surface = new Graphics();

  card.eventMode = "static";
  card.hitArea = drawHitArea();
  setContainer(card);
  parent.addChild(card);
  card.addChild(surface);

  $: {
    card.x = x;
    card.y = y;
  }

  /** Graphics ========== */
  const drawCard = (
    surface: Graphics,
    opts: {
      baseColor: string;
      hovered: boolean;
      selected: boolean;
      opacity: number;
    },
  ) => {
    const width = 2;
    surface.clear();

    surface.circle(0, 0, 40).fill({ color: opts.baseColor, alpha: opacity });

    // TODO: possibly move this to the store
    if (!opts.hovered && !opts.selected) {
      // clear any borders
      surface.stroke({ width, alpha: 0 });
    } else if (opts.hovered && opts.selected) {
      surface.circle(0, 0, 40);
      surface.stroke({ width, alpha: 1, color: hoveredAndSelected });
    } else if (opts.hovered) {
      surface.circle(0, 0, 40);
      surface.stroke({ width, alpha: 1, color: hoverColor });
    } else if (opts.selected) {
      surface.circle(0, 0, 40);
      surface.stroke({ width: width / 2, alpha: 1, color: selectColor });
    }
  };

  // TODO: Card can be hovered AND selected. Fix

  $: drawCard(surface, { baseColor: color, hovered, selected, opacity });

  /** Events ========== */
  forwardEvents(card);

  $: {
    x, y;
    card.emit("custom-transform", card);
  }

  onDestroy(() => {
    card.destroy({ children: true });
  });
</script>

<slot></slot>
