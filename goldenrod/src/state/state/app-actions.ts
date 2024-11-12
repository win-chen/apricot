import { showGraphModal } from "src/state/state/index";
import { createAction } from "src/user-input-tracker/user-input-tracker";
import { get } from "svelte/store";
import { addEdge } from "../actions_2.ts/add-edge";
import { addNodeOnClick } from "../actions_2.ts/add-node";
import { deleteSelectedNodes } from "../actions_2.ts/delete-selection";
import { toggleSelect } from "../actions_2.ts/select-node";
import { getNodeXY } from "../utils";
import { proposedEdgeSrc } from "./add-edge";
import { hoveredNodeId } from "./ui";

export const customInput = {
  node_is_hovered: hoveredNodeId,
  add_edge_source_node: proposedEdgeSrc,
} as const;
export type CustomInput = typeof customInput; // TODO: remove partial

const createAppAction = createAction<CustomInput>;

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
