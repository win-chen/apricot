/**
 * Use to forward events from pixi container to svelte parent
 * Usage:
 * 
 * // in MyComponent.svelte
 * forwardEvents(container)
 * 
 * // when rendering MyComponent
 * <MyComponent on:click={handleClick}>
 */
import type { Container, FederatedEvent } from "pixi.js";
import { createEventDispatcher } from "svelte";

const defaultEvents = [
   "mouseover",
   "mouseout",
   "click",
   "pointerdown",
   "pointerup"
];

// Forwards all events from the given container as svelte component events.
export const forwardEvents = (container: Container, events = defaultEvents) => {
   const dispatch = createEventDispatcher();
   const dispatchEvent = (name: string) => (event: FederatedEvent) => {
      dispatch(name, event);
   }
   
   events.forEach((name) => {
      container.addListener(name, dispatchEvent(name))
   })
}
