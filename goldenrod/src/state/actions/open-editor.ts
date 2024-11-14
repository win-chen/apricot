import { get } from "svelte/store";
import { editingNodeId, editorIsOpen, hoveredNodeId } from "../stores/ui";

export const openEditor = () => {
  editingNodeId.set(get(hoveredNodeId));
};

export const closeEditor = () => {
  editingNodeId.set(undefined);
  editorIsOpen.set(false);
};
