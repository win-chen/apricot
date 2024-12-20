import type { FederatedPointerEvent } from "pixi.js";
import { addNodeRequest } from "src/graphql/requests";
import { optimisticAddNode } from "../lib/optimistic";
import { renderFrame } from "../stores/render-graph";
import { hoveredNodeId } from "../stores/ui";

export const renderNode = (id: string, text: string, x: number, y: number) => {
  optimisticAddNode({ id, text, x, y });
};

const addNode = (x: number, y: number) => {
  const { node, execute } = addNodeRequest(x, y);

  optimisticAddNode(node);
  hoveredNodeId.set(node.id);
  execute();
};

export const addNodeOnClick = (event: FederatedPointerEvent) => {
  const { x, y } = renderFrame.framePositionToCoord({
    top: event.clientY,
    left: event.clientX,
  });
  addNode(x, y);
};
