<script lang="ts">
  import { Container } from "pixi.js";
  import { getContainer, setContainer } from "./context";

  const container = new Container();
  let parent = getContainer();
  parent.addChild(container);
  setContainer(container);
</script>

<slot></slot>
