import { userInteractionTracker } from "src/lib/user-input-tracker/user-input-tracker";
import { type AppActions, type CustomInput } from "src/state/stores/index";
import { appActions, customInput } from "./stores/index";

export const interactionTracker = userInteractionTracker<
  AppActions,
  CustomInput
>(customInput);

interactionTracker.register(appActions);
