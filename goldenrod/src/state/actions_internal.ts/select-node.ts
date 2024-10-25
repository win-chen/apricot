import {
  hoveredNodeId,
  selectedNodeIds
} from "../state";
import { get } from "svelte/store";

export const toggleSelect = () => {
  const id = get(hoveredNodeId);
  id && selectedNodeIds.toggle(id);
  !id && selectedNodeIds.clear();
};
