import { get } from "svelte/store";
import { hoveredNodeId } from "../stores/ui";

// TODO: move to utils somewhere
export const copyToClipboard = async (content: string, successMsg: string) => {
  try {
    await navigator.clipboard.writeText(content);
    alert(successMsg);
  } catch (err) {
    alert(`Failed to copy: ${err}`);
  }
};

export const copyHoveredId = async () => {
  const id = get(hoveredNodeId) || "";
  await copyToClipboard(id, "Copied hovered id to clipboard");
};
