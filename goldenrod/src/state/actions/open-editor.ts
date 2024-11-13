import { get } from "svelte/store";
import { editingNodeId, hoveredNodeId } from "../stores/ui";

export const openEditor = () => {
  editingNodeId.set(get(hoveredNodeId));
};

export const closeEditor = () => {
  editingNodeId.set(undefined);
};
