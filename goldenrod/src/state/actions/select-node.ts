import { get } from "svelte/store";
import { hoveredNodeId, selectedNodeIds } from "../stores/ui";

export const toggleSelect = () => {
  const id = get(hoveredNodeId);
  id && selectedNodeIds.toggle(id);
  !id && selectedNodeIds.clear();
};
