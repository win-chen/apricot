import { writableSet } from "src/lib/svelte-utils/set";
import { writable } from "svelte/store";

export const hoveredNodeId = writable<string | undefined>(undefined);
export const editingNodeId = writable<string | undefined>();
export const pointerPos = writable({ x: 0, y: 0 });
// Set of nodeIds

export const selectedNodeIds = writableSet<string>([]);
export const editorId = writable<string | undefined>();
export const editorIsOpen = writable(false);


export const listener = writable<EventTarget | null>(null);
