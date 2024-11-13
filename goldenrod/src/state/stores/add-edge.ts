import { writable } from "svelte/store";

// Node id of source for new edge

export const proposedEdgeSrc = writable<string | undefined>(undefined); // Node id of target for new edge

// TODO: delete when fsm interactions is removed
export const proposedEdgeDest = writable<string | undefined>(undefined);
