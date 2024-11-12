import { get } from "svelte/store";
import { rootFsm } from "../fsms/root-fsm";
import { editingNodeId, hoveredNodeId } from "../state/ui";

export const openEditor = () => {
  editingNodeId.set(get(hoveredNodeId));
};

export const closeEditor = () => {
  editingNodeId.set(undefined);
  rootFsm.defaultState();
};
