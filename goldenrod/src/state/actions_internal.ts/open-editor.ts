import { editingNodeId } from "../state";
import { hoveredNodeId } from "../state";
import { get } from "svelte/store";
import { rootFsm } from "../fsms/root-fsm";

export const openEditor = () => {
  editingNodeId.set(get(hoveredNodeId));
};

export const closeEditor = () => {
  editingNodeId.set(undefined);
  rootFsm.defaultState();
}