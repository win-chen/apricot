import type { Node } from "src/gql/graphql";
import { nodeToPixiNode } from "../state/nodes";
import { graph } from "../state/render-graph";
import { selectedNodeIds } from "../state/ui";
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
