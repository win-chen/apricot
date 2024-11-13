import { showGraphModal } from "src/state/state/index";
import { get, writable } from "svelte/store";
import { addEdge } from "../actions_2.ts/add-edge";
import { addNodeOnClick } from "../actions_2.ts/add-node";
import { deleteSelectedNodes } from "../actions_2.ts/delete-selection";
import { dragNode } from "../actions_2.ts/drag-node";
import { toggleSelect } from "../actions_2.ts/select-node";

import { createAction as _createAction } from "src/user-input-tracker/user-input-tracker";
import { getNodeXY } from "../utils";
import { proposedEdgeSrc } from "./add-edge";
import { hoveredNodeId } from "./ui";

export const customInput = {
  node_is_hovered: hoveredNodeId,
  add_edge_source_node: proposedEdgeSrc,
  is_dragging_node: writable(false),
} as const;
export type CustomInput = typeof customInput; // TODO: remove partial

const createAppAction = _createAction<CustomInput>;

export const appActions = {
  addNode: createAppAction({
    input: ["A", "CLICK"], //auto complete
    onEnter: addNodeOnClick,
  }),
  addEdge_: createAppAction({
    input: ["E"],
    onLeave: addEdge.clear,
  }),
  addEdge_selectSrcc: createAppAction({
    input: ["not:add_edge_source_node", ["E", "node_is_hovered"], "CLICK"],
    onEnter: addEdge.setSrc,
  }),
  addEdge_submit: createAppAction({
    input: ["E", "add_edge_source_node", "node_is_hovered", "CLICK"],
    onEnter: addEdge.submit,
  }),
  addEdge_reset: createAppAction({
    input: [["E", "not:node_is_hovered"], "CLICK"],
    onEnter: addEdge.clear,
  }),
  deleteNodes: createAppAction({
    input: ["BACKSPACE"],
    onEnter: deleteSelectedNodes,
  }),
  dragNode_: createAppAction({
    input: ["D"],
    store: customInput.is_dragging_node,
  }),
  dragNode_dragStart: createAppAction({
    input: [["D", "node_is_hovered"], "CLICK"],
    onEnter: dragNode.start,
  }),
  dragNode_drag: createAppAction({
    input: ["is_dragging_node", "CLICK"],
    onLeave: dragNode.finish,
  }),
  graph_modal: createAppAction({
    input: ["node_is_hovered", "B"],
    onEnter: () => {
      const { x, y } = getNodeXY(get(hoveredNodeId)!);

      showGraphModal.set({
        id: get(hoveredNodeId) || "",
        x,
        y,
        isOpen: true,
      });
    },
  }),
  selectNode: createAppAction({
    input: ["S", "CLICK"], // TODO: fix, is dummy
    onEnter: toggleSelect,
  }),
} as const;

export type AppActions = keyof typeof appActions;
