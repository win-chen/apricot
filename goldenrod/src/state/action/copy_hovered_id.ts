import { get } from "svelte/store";
import { hoveredNodeId } from "../state";

export const copyHoveredId = async () => {
  const id = get(hoveredNodeId) || "";
  console.log("copying!", id);
  try {
    await navigator.clipboard.writeText(id);
    console.log("Content copied to clipboard");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};
