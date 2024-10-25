<script lang="ts">
  import {
    getContentContainer,
    getListenerContainer,
  } from "src/components/pixi-svelte/context";
  import { trackPointer } from "src/state/interactions/track-pointer";
  import { rootFsm } from "../fsms/root-fsm";
  import DragNode from "./DragNode.svelte";
  import { derived } from "svelte/store";
  import { graph, hoveredNodeId } from "../state";
  import AddEdge from "./AddEdge.svelte";
  import AddNode from "./AddNode.svelte";
  import { renderFrame } from "../state";
  import SelectNode from "./SelectNode.svelte";
  import PanCanvas from "./PanCanvas.svelte";
  import Zoom from "./Zoom.svelte";
  import { onMount } from "svelte";
  import DeleteNode from "./DeleteNode.svelte";
  import OpenEditor from "./OpenEditor.svelte";

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
<AddNode {listener} {renderFrame}></AddNode>
<SelectNode {listener}></SelectNode>
<PanCanvas {listener} container={content}></PanCanvas>
<Zoom container={content}></Zoom>
<DeleteNode></DeleteNode>
<OpenEditor></OpenEditor>
