// Meta keys must be pressed before keys in combinations
// Should not include shifted characters - see README on shifted combinations
export enum Key {
  /** Meta keys */
  CTRL = "control",
  ALT = "alt", // "Option" on mac
  SHIFT = "shift",

  // Key combinations pressed with "Meta" do NOT work
  // They are collapsed into one key up when keys are lifted simultaneously
  // META = "meta", // "Window" or "Command"

  /** Unshifted keys */
  A = "a",
  B = "b",
  C = "c",
  D = "d",
  E = "e",
  F = "f",
  W = "w",
  PERIOD = ".",
  FORWARD_SLASH = "/",
  BACKSPACE = "backspace",
  ESCAPE = "escape",
  ONE = "1",
  TWO = "2",
}

export interface ShortcutConfig {
  name: string;
  keys: Key[];
  onPress?: (...args: any[]) => void;
}
