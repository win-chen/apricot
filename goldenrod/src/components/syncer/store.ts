import { writable } from "svelte/store";

export const lastSync = writable<string>();

export const pauseSync = writable<boolean>(true);