<script lang="ts">
  import {
    getContentContainer,
    getListenerContainer,
  } from "src/components/pixi-svelte/context";
  import { trackPointer } from "src/state/interactions/track-pointer";
  import { onMount } from "svelte";
  import { derived } from "svelte/store";
  import { rootFsm } from "../fsms/root-fsm";
  import { graph } from "../state/render-graph";
  import { hoveredNodeId } from "../state/ui";
  import AddEdge from "./AddEdge.svelte";
  import DeleteNode from "./DeleteNode.svelte";
  import DragNode from "./DragNode.svelte";
  import OpenEditor from "./OpenEditor.svelte";
  import PanCanvas from "./PanCanvas.svelte";
  import SelectNode from "./SelectNode.svelte";
  import Zoom from "./Zoom.svelte";

  const listener = getListenerContainer();
  // TODO: Instead of passing content, pass renderFrame
  const content = getContentContainer();
  listener.on("globalpointermove", trackPointer);

  const hoveredNode = derived([hoveredNodeId, graph.nodes], ([$id, $map]) => {
    if ($id) {
      return $map[$id];
    }
    return undefined;
  });

  onMount(() => {
    rootFsm.defaultState();
  });
</script>

<DragNode {listener} {hoveredNode} container={content}></DragNode>
<AddEdge {listener}></AddEdge>
<SelectNode {listener}></SelectNode>
<PanCanvas {listener} container={content}></PanCanvas>
<Zoom container={content}></Zoom>
<DeleteNode></DeleteNode>
<OpenEditor></OpenEditor>
