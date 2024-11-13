import { showGraphModal } from "src/state/stores/index";
import { get, writable } from "svelte/store";
import { addEdge } from "../actions/add-edge";
import { addNodeOnClick } from "../actions/add-node";
import { deleteSelectedNodes } from "../actions/delete-selection";
import { dragNode } from "../actions/drag-node";
import { toggleSelect } from "../actions/select-node";

import { createAction as _createAction } from "src/user-input-tracker/user-input-tracker";
import { copyHoveredId } from "../actions/copy_hovered_id";
import { openEditor } from "../actions/open-editor";
import { panCanvas } from "../actions/pan-canvas";
import { zoomIn, zoomOut } from "../actions/zoom";
import { getNodeXY } from "../lib/utils";
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
  copyHoveredId: createAppAction({
    input: ["node_is_hovered", "C"],
    onEnter: copyHoveredId,
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
  openEditor: createAppAction({
    input: ["node_is_hovered", "W"],
    onEnter: openEditor,
  }),
  panCanvas: createAppAction({
    input: ["F", "CLICK"],
    onEnter: panCanvas.start,
    onLeave: panCanvas.end,
  }),
  selectNode: createAppAction({
    input: ["S", "CLICK"], // TODO: fix, is dummy
    onEnter: toggleSelect,
  }),
  zoomIn: createAppAction({
    input: ["PERIOD"],
    onEnter: zoomIn.start,
    onLeave: zoomIn.stop,
  }),
  zoomOut: createAppAction({
    input: ["FORWARD_SLASH"],
    onEnter: zoomOut.start,
    onLeave: zoomOut.stop,
  }),
} as const;

export type AppActions = keyof typeof appActions;
