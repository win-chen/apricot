import dot from "graphlib-dot";
import { type AppActions, type CustomInput } from "src/state/state/index";
import { userInteractionTracker } from "src/user-input-tracker/user-input-tracker";
import { appActions, customInput } from "./state/index";

export const interactionTracker = userInteractionTracker<
  AppActions,
  CustomInput
>(customInput);

interactionTracker.register(appActions);

console.log(dot.write(interactionTracker.inputTrie));
