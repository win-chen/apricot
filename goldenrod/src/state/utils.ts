import { derived, get, writable } from "svelte/store";
import { nodeToPixiNode } from "./nodes";
import { graph, renderFrame } from "./state";
import { type Edge, type GraphFull } from "src/gql/graphql";
import { EdgeLabel, type PixiEdge, type PixiNode } from "./types";
import { edgeColor } from "src/config/colors";
import { Graph, alg } from "@dagrejs/graphlib";

export const setGraphFromGraphfull = (assets: GraphFull) => {
  // Make render root node
  const rootNode = nodeToPixiNode({
    id: "root",
    x: 0.0,
    y: 0.0,
    text: "root",
  });
  graph.setNode(rootNode.id, rootNode);
  const unclustered = nodeToPixiNode({
    id: "unclustered",
    x: 0.0,
    y: 0.0,
    text: "unclustered",
  });
  graph.setNode(unclustered.id, unclustered);

  graph.setNodes(assets.nodes.map(nodeToPixiNode), rootNode.id);
  graph.setEdges(
    assets.edges.map((edge) => {
      const pixiEdge = edgeToPixiEdge(edge);
      return { srcId: edge.source, sinkId: edge.target, edge: pixiEdge };
    })
  );
};

export const readableNodePosition = (id: string) => {
  const { position } = get(graph.nodes)[id].ui;
  return derived(position, ({ top, left }) => ({ top, left }));
};
export const shouldRenderNode = (node: PixiNode) => {
  const { x, y } = node.attr;
  const { width, height } = get(node.ui.dimensions);
  return renderFrame.shouldRender({
    x: get(x),
    y: get(y),
    width,
    height,
  });
};

const getEdgeId = (src: string, dest: string) => ["edge", src, dest].join("_");

export const edgeNodesFromId = (edgeId: string) => {
  const [_, src, dest] = edgeId.split("_");
  return { src, dest };
};

export const edgeToPixiEdge = (edge: Edge): PixiEdge => {
  return pixiEdge(edge.source, edge.target);
};

export const getNodesFromEdgeId = (edgeId: string) => {
  const { src, dest } = edgeNodesFromId(edgeId);
  return { src: get(graph.nodes)[src], dest: get(graph.nodes)[dest] };
};

export const pixiEdge = (src: string, dest: string) => {
  return {
    id: getEdgeId(src, dest),
    label: EdgeLabel.LINKED,
    src: readableNodePosition(src),
    dest: readableNodePosition(dest),
    color: edgeColor,
    opacity: writable(1),
  };
};

export const nodesAreConnected = (id: string, id2: string) => {
  return (graph.state.neighbors(id) || []).includes(id2);
};

export function getRandomColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, "0")}`;
}

/**
 * Checks if two subgraphs are connected. Subgraphs are defined by parent id
 * @param id - parent of subgraph1
 * @param id2 - parent of subgraph2
 */
export const dijkstraHelper = () => {
  const result = alg.dijkstraAll(graph.state as Graph);

  const isSuccessor = (idA: string, idB: string) => {
    return idA != idB && result[idA][idB]?.distance !== Infinity;
  };

  return {
    subgraphsAreConnected: (id: string, id2: string) => {
      const subgraph1 = graph.state.children(id);
      const subgraph2 = graph.state.children(id2);

      for (let i = 0; i < subgraph1.length; i++) {
        for (let j = 0; j < subgraph2.length; j++) {
          const idA = subgraph1[i];
          const idB = subgraph2[j];

          if (isSuccessor(idA, idB) || isSuccessor(idB, idA)) {
            return true;
          }
        }
      }
      return false;
    },
  };
};
