import { executeDeleteNode } from "src/graphql/requests";
import { optimisticRemoveNode } from "./optimistic";

export const deleteNode = (id: string) => {
  optimisticRemoveNode(id);
  executeDeleteNode(id);
};