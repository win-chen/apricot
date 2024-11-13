import { type AppActions, type CustomInput } from "src/state/stores/index";
import { userInteractionTracker } from "src/user-input-tracker/user-input-tracker";
import { appActions, customInput } from "./stores/index";

export const interactionTracker = userInteractionTracker<
  AppActions,
  CustomInput
>(customInput);

interactionTracker.register(appActions);
