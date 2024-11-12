import { cardColor, hoverForEdgeCreate } from "src/config/colors";
import { type Node } from "src/gql/graphql";
import { deepWritable } from "src/lib/svelte-utils/deep-writable";
import { derived, get, writable } from "svelte/store";
import { type Attrs, type PixiNode, type UI } from "../types";
import { proposedEdgeSrc } from "./add-edge";
import { appActions } from "./app-actions";
import { renderFrame } from "./render-graph";
import { hoveredNodeId, selectedNodeIds } from "./ui";

export type DerivedNodeData = ReturnType<typeof deriveNodeData>;

const createAttr = (node: Node): Attrs => {
  const { id, ...rest } = node;

  const result = {
    id,
    ...deepWritable(rest),
  };
  return result;
};

const initUi = (attr: Attrs) => {
  const ui: UI = {
    dimensions: writable({ width: 0, height: 0 }),
    position: writable({ top: 0, left: 0 }),
    opacity: writable(1),
    inFrame: writable(false),
    shouldRender: writable(false),
    color: writable(null),
  };

  // TODO: don't do this. Create new derived position
  const updatePosition = () =>
    ui.position.set(
      renderFrame.coordToContainerPosition({
        x: get(attr.x),
        y: get(attr.y),
      })
    );

  attr.x.subscribe(updatePosition);
  attr.y.subscribe(updatePosition);
  renderFrame.on("frame-change", updatePosition);

  return ui;
};

export const nodeToPixiNode = (node: Node): PixiNode => {
  const attr = createAttr(node);
  const derived = deriveNodeData(attr);
  const ui = initUi(attr);
  return { id: node.id, attr, derived, ui };
};

const deriveNodeData = (nodeStore: Attrs) => {
  const id = nodeStore.id;
  const isSelected = derived(selectedNodeIds, ($selectedNodeIds) => {
    return $selectedNodeIds.includes(id);
  });
  const isHovered = derived(hoveredNodeId, ($id) => id === $id);

  const surfaceColor = derived(
    [isHovered, proposedEdgeSrc, appActions.addEdge_.store],
    ([$isHovered, $proposedEdgeSrc, $addingEdge]) => {
      if ($proposedEdgeSrc == id || ($addingEdge && $isHovered)) {
        return hoverForEdgeCreate;
      }
      return cardColor;
    }
  );

  return {
    isSelected,
    isHovered,
    surfaceColor,
  };
};
