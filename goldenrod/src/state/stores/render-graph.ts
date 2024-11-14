import { Graph } from "@dagrejs/graphlib";
import dot from "graphlib-dot";
import { createGraph } from "src/lib/svelte-utils/graphlib-store/graphlib-store";
import { writableSet } from "src/lib/svelte-utils/set";
import { RelativeRenderFrame } from "src/lib/svelte-utils/svelte-infinite-canvas/relative-render";
import { derived, get, writable } from "svelte/store";
import { RENDER_ROOT_ID, getEdgeNodes } from "../lib/utils";
import { withClusters } from "../lib/with-clusters";
import { type PixiEdge, type PixiNode } from "./types";

export const graph = withClusters(
  createGraph<PixiNode, PixiEdge>(),
  RENDER_ROOT_ID
);

export const currentSubgraphToDOT = () => {
  const subgraph = new Graph({
    directed: true,
  });

  get(graph.nodesInView).forEach((node) => {
    subgraph.setNode(node.id);
  });

  get(graph.edgesInView).forEach((edge) => {
    const { src, dest } = getEdgeNodes(graph, edge.id);

    subgraph.setEdge(src, dest);
  });

  return dot.write(subgraph as Graph);
};

// Contains the originPoint, scale, and dimension stores
export const renderFrame = new RelativeRenderFrame();

export const nodeIdsInFrame = writableSet<string>([]);

// TODO: only render nodes around the frame?
// Another option would be to only load the nodes around the frame?
export const renderedNodes = derived([graph.nodesInView], ([nodes]) => nodes);
export const renderedEdges = derived([graph.edgesInView], ([edges]) => edges);

export const GRAPH_MODAL_STATE_DEFAULT = { id: "", x: 0, y: 0, isOpen: false };
export const graphModalState = writable(GRAPH_MODAL_STATE_DEFAULT);
