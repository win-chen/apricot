import { Container } from "pixi.js";
import { getContext, setContext } from "svelte";

const kParentKey = "parent-container";
const kInteractionCanvas = "interaction-container";
const kContentContainer = "content-container";
const kListenerContainer = "listener-container";

export const setContainer = (val: Container) => setContext(kParentKey, val);

export const getContainer = () => getContext<Container>(kParentKey);

export const setInteractionCanvas = (val: Container) =>
  setContext(kInteractionCanvas, val);

export const getInteractionCanvas = () =>
  getContext<Container>(kInteractionCanvas);

// TODO: Deprecate
export const setContentContainer = (val: Container) =>
  setContext(kContentContainer, val);

export const getContentContainer = () =>
  getContext<Container>(kContentContainer);

export const setListenerContainer = (val: Container) =>
  setContext(kListenerContainer, val);

export const getListenerContainer = () =>
  getContext<Container>(kListenerContainer);
