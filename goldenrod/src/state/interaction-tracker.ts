import type { ConfigList } from "src/user-input-tracker/types";
import { userInteractionTracker } from "src/user-input-tracker/user-input-tracker";
import { showGraphModal, pointerPos } from "./state";
import { get } from "svelte/store";

const customInput = {};

export const interactionTracker = userInteractionTracker(customInput);
const config: ConfigList<typeof customInput> = {
  first_shortcut: {
    input: ["B", "CLICK"],
    onEnter: () => {
      const { x, y } = get(pointerPos);

      showGraphModal.set({
        x,
        y,
        isOpen: true,
      });
    },
  },
};

interactionTracker.register(config);
