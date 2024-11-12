import { executeDeleteNode } from "src/graphql/requests";
import { get } from "svelte/store";
import { selectedNodeIds } from "../state/ui";
import { optimisticRemoveNode } from "./optimistic";

export const deleteSelectedNodes = () => {
  const nodeIds = [...get(selectedNodeIds)];
  nodeIds.forEach((id) => {
    // TODO: also optimistically remove edges
    // TODO: deleting node without an edge fails
    optimisticRemoveNode(id);
    executeDeleteNode(id);
  });
};

export const undoDeleteSelectedNodes = ({ nodeIds }) => {};
