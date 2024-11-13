import { executeDeleteNode } from "src/graphql/requests";
import { get } from "svelte/store";
import { optimisticRemoveNode } from "../lib/optimistic";
import { selectedNodeIds } from "../state/ui";

export const deleteSelectedNodes = () => {
  const nodeIds = [...get(selectedNodeIds)];
  nodeIds.forEach((id) => {
    // TODO: also optimistically remove edges
    // TODO: deleting node without an edge fails
    optimisticRemoveNode(id);
    executeDeleteNode(id);
  });
};
