import { selectedNodeIds } from "../state";
import { get } from "svelte/store";
import { optimisticRemoveNode } from "./optimistic";
import { executeDeleteNode } from "src/graphql/requests";

export const deleteSelectedNodes = () => {
  const nodeIds = [...get(selectedNodeIds)];
  nodeIds.forEach((id) => {
    // TODO: also optimistically remove edges
    // TODO: deleting node without an edge fails
    optimisticRemoveNode(id);
    executeDeleteNode(id);
  });
};

export const undoDeleteSelectedNodes = ({ nodeIds }) => {
  
};