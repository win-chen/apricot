import { writable } from "svelte/store";
import { debounceFn } from "./debounce";

export const createResizeStore = () => {
   const store = writable({ width: 0, height: 0 });

   const observer = new ResizeObserver(debounceFn((entries: ResizeObserverEntry[]) => {
      for (let entry of entries) {
         const { width, height } = entry.contentRect;
         store.set({ width, height });
      }
   }, 30));

   return {
     store,
     observer
   };
}