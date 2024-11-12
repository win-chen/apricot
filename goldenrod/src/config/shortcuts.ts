import { Key, type ShortcutConfig } from "src/components/keyboard-ctrl/types";
import { copyHoveredId } from "src/state/action/copy_hovered_id";
import { UserAction } from "src/state/action/types";
import { InteractionState } from "src/state/fsms/types";

export type ShortcutEnum = InteractionState;

// Export "as const" in addition to exporting type union because we can't Object.values(typeUnionedEnum)
export const Shortcut = {
  ...InteractionState,
  ...UserAction,
} as const;

export const defaultShortcuts: ShortcutConfig[] = [
  { name: InteractionState.EDITING, keys: [Key.W] },
  { name: InteractionState.DRAG_NODE, keys: [Key.D] },
  { name: InteractionState.PAN, keys: [Key.F] },
  { name: InteractionState.ZOOM_IN, keys: [Key.PERIOD] },
  { name: InteractionState.ZOOM_OUT, keys: [Key.FORWARD_SLASH] },
  {
    name: UserAction.COPY_HOVERED_ID,
    keys: [Key.C],
    onPress: copyHoveredId,
  },
];
