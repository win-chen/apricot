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
    const modalNode = $nodes[$graphModalState.id];
    modalNode.attr.text.set(graphName);

    const layoutGraph = new dagre.graphlib.Graph();

    // Set an object for the graph label
    layoutGraph.setGraph({});

    // Default to assigning a new object as a label for each new edge.
    layoutGraph.setDefaultEdgeLabel(function () {
      return {};
    });

    input.nodes().forEach((id) => {
      layoutGraph.setNode(id, {
        id,
        width: 100,
        height: 100,
        x: Number(input.node(id).x),
        y: Number(input.node(id).y),
      });
    });

    input.edges().forEach((edge) => layoutGraph.setEdge(edge.v, edge.w));

    let layoutApplied = false;
    if (
      layoutGraph.nodes().some((id) => {
        const { x, y } = layoutGraph.node(id);
        return !x || !y;
      })
    ) {
      console.log("Missing x, y attribute on some node. Laying out graph.");
      dagre.layout(layoutGraph);
      layoutApplied = true;
    }

    const topMostNode = layoutGraph.nodes().reduce((topMost, node) => {
      const { y } = layoutGraph.node(node);
      if (layoutGraph.node(topMost).y > y) {
        return node;
      }
      return topMost;
    }, layoutGraph.nodes()[0]);

    console.log("top most node", topMostNode);

    const _centerNodes = () => {
      const offsetX = $graphModalState.x - layoutGraph.graph().width! / 2;
      const offsetY = $graphModalState.y + 100;
      return (x: number, y: number) => {
        return { x: x + offsetX, y: y + offsetY };
      };
    };

    const _placeRelativeToNode = () => {
      const { x, y } = layoutGraph.node(topMostNode);
      const offsetX = $graphModalState.x - x;
      const offsetY = $graphModalState.y + 100 - y;

      return (x: number, y: number) => {
        return { x: x + offsetX, y: y + offsetY };
      };
    };

    const offsetFn = layoutApplied ? _centerNodes() : _placeRelativeToNode();

    layoutGraph.nodes().forEach((id) => {
      const { x: nodeX, y: nodeY } = layoutGraph.node(id);
      const { label } = input.node(id);
      const text = label || id;

      const { x, y } = offsetFn(nodeX, nodeY);

      renderNode(id, text, x, y);
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
