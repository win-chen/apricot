import { get } from "svelte/store";
import { hoveredNodeId, selectedNodeIds } from "../state/ui";

export const toggleSelect = () => {
  const id = get(hoveredNodeId);
  id && selectedNodeIds.toggle(id);
  !id && selectedNodeIds.clear();
};
