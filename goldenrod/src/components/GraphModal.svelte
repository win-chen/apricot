<script lang="ts">
  import { showGraphModal, graph } from "src/state/state";
  import Modal from "./Modal.svelte";
  import dot from "graphlib-dot";
  import * as d3 from "d3-force";
  import { renderNode } from "src/state/actions_internal.ts/add-node";
  import { optimisticAddEdge } from "src/state/actions_internal.ts/optimistic";
  import type { Graph } from "@dagrejs/graphlib";
  import dagre from "@dagrejs/dagre";

  let inputText = "";

  const handleClose = () => {
    const input = dot.read(inputText);
    const dGraph = new dagre.graphlib.Graph();

    // Set an object for the graph label
    dGraph.setGraph({});

    // Default to assigning a new object as a label for each new edge.
    dGraph.setDefaultEdgeLabel(function () {
      return {};
    });

    input
      .nodes()
      .forEach((node) =>
        dGraph.setNode(node, { id: node, width: 100, height: 100 }),
      );
    input.edges().forEach((edge) => dGraph.setEdge(edge.v, edge.w));

    dagre.layout(dGraph);

    dGraph.nodes().forEach((name) => {
      const { x, y } = dGraph.node(name);
      renderNode(name, x, y);
    });
    dGraph.edges().forEach((edge) => {
      optimisticAddEdge(edge.v, edge.w);
    });
  };
</script>

<Modal showModal={$showGraphModal.isOpen} onClose={handleClose}>
  <textarea bind:value={inputText}></textarea>
</Modal>
