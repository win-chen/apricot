<script lang="ts">
  import dagre from "@dagrejs/dagre";
  import dot from "graphlib-dot";
  import { renderNode } from "src/state/actions/add-node";
  import { interactionTracker } from "src/state/interaction-tracker";
  import { optimisticAddEdge } from "src/state/lib/optimistic";
  import { graph, graphModalState } from "src/state/stores/index";
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

    const offsetX = $graphModalState.x - dGraph.graph().width! / 2;
    const offsetY = $graphModalState.y + 100;

    let topMostNode = dGraph.nodes()[0];
    const dGraphNode = (name: string) => dGraph.node(name);

    dGraph.nodes().forEach((name) => {
      const node = dGraph.node(name);
      const { x, y } = node;
      renderNode(name, x + offsetX, y + offsetY);
      if (dGraphNode(topMostNode).y > y) {
        topMostNode = name;
      }
    });
    dGraph.edges().forEach((edge) => {
      optimisticAddEdge(edge.v, edge.w);
    });

    optimisticAddEdge($graphModalState.id, topMostNode);
  };

  onMount(() => {
    interactionTracker.disable();
  });
</script>

<Modal showModal={$graphModalState.isOpen} onClose={handleClose}>
  <textarea bind:value={inputText}></textarea>
</Modal>
