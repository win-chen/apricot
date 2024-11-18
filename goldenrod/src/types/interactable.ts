import { hoveredNodeId, selectedNodeIds } from "src/state/stores";
import { derived, type Readable } from "svelte/store";

export interface Interactable {
  isSelected: Readable<boolean>;
  isHovered: Readable<boolean>;
}

export const createInteractable = (id: string): Interactable => {
  return {
    isSelected: derived(selectedNodeIds, ($selected) => {
      return $selected.includes(id);
    }),
    isHovered: derived(hoveredNodeId, ($hovered) => {
      return $hovered == id;
    }),
  };
};
