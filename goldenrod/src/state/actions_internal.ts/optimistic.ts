import { get, writable } from "svelte/store";
import { nodeToPixiNode } from "../nodes";
import type { Node } from "src/gql/graphql";
import { graph, selectedNodeIds } from "../state";
import { pixiEdge } from "../utils";

export const optimisticRemoveNode = (id: string) => {
  selectedNodeIds.delete(id);
  graph.removeNode(id);
};

export const optimisticAddNode = (node: Node) => {
  graph.setNodeUnclustered(node.id, nodeToPixiNode(node));
};

export const optimisticAddEdge = (src: string, dest: string) => {
  const edge = pixiEdge(src, dest);
  graph.setEdge(src, dest, edge);
};
