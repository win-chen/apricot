<script lang="ts">
  import dagre from "@dagrejs/dagre";
  import dot from "graphlib-dot";
  import { renderNode } from "src/state/actions/add-node";
  import { interactionTracker } from "src/state/interaction-tracker";
  import { optimisticAddEdge } from "src/state/lib/optimistic";
  import {
    graph,
    GRAPH_MODAL_STATE_DEFAULT,
    graphModalState,
  } from "src/state/stores/index";
  import { onMount } from "svelte";
  import Modal from "./Modal.svelte";

  let inputText = "";

  const { nodes } = graph;

  const handleClose = () => {
    interactionTracker.enable();

    const input = dot.read(inputText);

    // Update name of original node
    // dagre typing is incorrect, casting to unknown
    const graphName = (input.graph() as unknown as { id: string }).id;
    const node = $nodes[$graphModalState.id];
    node.attr.text.set(graphName);

    const layoutGraph = new dagre.graphlib.Graph();

    // Set an object for the graph label
    layoutGraph.setGraph({});

    // Default to assigning a new object as a label for each new edge.
    layoutGraph.setDefaultEdgeLabel(function () {
      return {};
    });

    input.nodes().forEach((id) =>
      layoutGraph.setNode(id, {
        id,
        width: 100,
        height: 100,
      }),
    );
    input.edges().forEach((edge) => layoutGraph.setEdge(edge.v, edge.w));

    dagre.layout(layoutGraph);

    const offsetX = $graphModalState.x - layoutGraph.graph().width! / 2;
    const offsetY = $graphModalState.y + 100;

    let topMostNode = layoutGraph.nodes()[0];
    const dGraphNode = (name: string) => layoutGraph.node(name);

    layoutGraph.nodes().forEach((id) => {
      const { x, y } = layoutGraph.node(id);
      const { label } = input.node(id);
      const text = label || id;
      renderNode(id, text, x + offsetX, y + offsetY);
      if (dGraphNode(topMostNode).y > y) {
        topMostNode = text;
      }
    });
    layoutGraph.edges().forEach((edge) => {
      optimisticAddEdge(edge.v, edge.w);
    });

    optimisticAddEdge($graphModalState.id, topMostNode);

    // Clear state
    graphModalState.set(GRAPH_MODAL_STATE_DEFAULT);
  };

  onMount(() => {
    interactionTracker.disable();
  });
</script>

<Modal showModal={$graphModalState.isOpen} onClose={handleClose}>
  <textarea bind:value={inputText}></textarea>
</Modal>
