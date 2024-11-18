import type { GraphStore } from "src/lib/svelte-utils/graphlib-store/graphlib-store";
import { ElementType, createBaseElement } from "./element";
import { type BlockStack } from "./types";

export const createBlockStack = (): BlockStack => {
  return {
    ...createBaseElement(),
    type: ElementType.CONTAINER,
  };
};

export const addBlockStackToGraph = (
  id1: string,
  id2: string,
  graph: GraphStore
): BlockStack => {
  const stack = createBlockStack();
  graph.setNode(stack.id, stack);

  // Make edges to graph

  return stack;
};
