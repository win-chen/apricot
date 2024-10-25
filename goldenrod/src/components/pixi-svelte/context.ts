import { Container } from "pixi.js";
import { getContext, setContext } from "svelte";
import type { Writable } from "svelte/store";

const kParentKey = "parent-container";
const kInteractionCanvas = "interaction-container";
const kContentContainer = "content-container";
const kListenerContainer = "listener-container";
const kCanvasScale = "canvas-scale";

export const setContainer = (val: Container) => setContext(kParentKey, val);

export const getContainer = () => getContext<Container>(kParentKey);


export const setInteractionCanvas = (val: Container) => setContext(kInteractionCanvas, val);

export const getInteractionCanvas = () => getContext<Container>(kInteractionCanvas);


// TODO: Deprecate
export const setContentContainer = (val: Container) => setContext(kContentContainer, val);

export const getContentContainer = () => getContext<Container>(kContentContainer);

export const setCanvasScale = (scale: Writable<number>) => setContext(kCanvasScale, scale);

export const getCanvasScale = () => getContext<Writable<number>>(kCanvasScale);

export const setListenerContainer = (val: Container) => setContext(kListenerContainer, val);

export const getListenerContainer = () => getContext<Container>(kListenerContainer);
