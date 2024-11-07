import type { ConfigList } from "src/user-input-tracker/types";
import { userInteractionTracker } from "src/user-input-tracker/user-input-tracker";
import { showGraphModal, pointerPos, hoveredNodeId } from "../state/state";
import { get } from "svelte/store";
import { getNodeXY } from "src/state/utils";

const customInput = {
  node_is_hovered: hoveredNodeId,
};

export const interactionTracker = userInteractionTracker(customInput);
const config: ConfigList<typeof customInput> = {
  graph_modal: {
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
  },
};

interactionTracker.register(config);
