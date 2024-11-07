import { optimisticAddNode } from "./optimistic";
import type { FederatedPointerEvent } from "pixi.js";
import { addNodeRequest } from "src/graphql/requests";
import type { RelativeRenderFrame } from "src/lib/svelte-utils/svelte-infinite-canvas/relative-render";
import { hoveredNodeId } from "../state";

export const renderNode = (id: string, x: number, y: number) => {
  optimisticAddNode({ id, text: id, x, y });
};

const addNode = (x: number, y: number) => {
  const { node, execute } = addNodeRequest(x, y);

  optimisticAddNode(node);
  hoveredNodeId.set(node.id);
  execute();
};

export const createAddNodeInstance = (renderFrame: RelativeRenderFrame) => {
  const addNodeOnClick = (event: FederatedPointerEvent) => {
    const { x, y } = renderFrame.framePositionToCoord({
      top: event.clientY,
      left: event.clientX,
    });
    addNode(x, y);
  };

  return {
    addNodeOnClick,
  };
};
