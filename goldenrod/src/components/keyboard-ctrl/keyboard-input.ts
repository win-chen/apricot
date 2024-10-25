import { EventEmitter } from "pixi.js";
import { getUnshiftedKey } from "./utils";
import type { Key, ShortcutConfig } from "./types";
import { writableSet, withSubscribableActions } from "src/lib/svelte-utils/set";
import { get } from "svelte/store";
import { arraysEqual } from "src/lib/arrays-equal";

// Creates press event name for given event name
export const pressEvent = (eventName: string) => {
  return `${eventName}:pressed`;
};

// Creates lifted event name for given event name
export const liftEvent = (eventName: string) => {
  return `${eventName}:lifted`;
};

// Returns an instance of
const KeyboardInput = () => {
  const events = new EventEmitter();

  const registeredShortcuts = new Map<string, Key[]>();
  const enabledShortcuts = new Set<string>();

  const pressedKeys = new Set<Key>();
  const activeShortcuts = withSubscribableActions(writableSet<string>([]));

  const maybeActivateShortcuts = (key: Key) => {
    const activatedShortcuts = [];
    for (const name of enabledShortcuts) {
      const keyset = registeredShortcuts.get(name)!;
      if (keyset.includes(key) && keyset.every((key) => pressedKeys.has(key))) {
        activeShortcuts.add(name);
        activatedShortcuts.push(name);
      }
    }
    return activatedShortcuts;
  };

  const deactivateAnyShortcuts = (key: Key) => {
    const activeSc = get(activeShortcuts);
    activeSc.forEach((shortcutName) => {
      const keyset = registeredShortcuts.get(shortcutName)!;
      if (keyset.includes(key)) {
        activeShortcuts.delete(shortcutName);
      }
    });
  };

  // returns activated shortcut if any
  const pressTheKey = (key: Key) => {
    if (pressedKeys.has(key)) {
      return;
    }
    pressedKeys.add(key);
    events.emit(pressEvent(key));
    return maybeActivateShortcuts(key);
  };

  const liftTheKey = (key: Key) => {
    if (!pressedKeys.has(key)) {
      return;
    }
    pressedKeys.delete(key);
    events.emit(liftEvent(key));
    deactivateAnyShortcuts(key);
  };

  activeShortcuts.onAdd((shortcut) => {
    events.emit(pressEvent(shortcut));
  });

  activeShortcuts.onDelete((shortcut) => {
    events.emit(liftEvent(shortcut));

    if (get(activeShortcuts).length == 0) {
      events.emit("~");
    }
  });

  const getShortcutByKeyset = (keyset: Key[]) => {
    for (const [name, registeredKeyset] of registeredShortcuts) {
      if (arraysEqual(keyset, registeredKeyset)) {
        return name;
      }
    }
  };

  const shortcutIsValid = (shortcut: ShortcutConfig) => {
    const { name, keys } = shortcut;
    if (registeredShortcuts.has(name)) {
      // TODO: instead of silently fail, send up warning log
      return false;
    }
    const existingShortcut = getShortcutByKeyset(keys);
    if (existingShortcut) {
      throw new Error(
        `Invalid shortcut: ${JSON.stringify(
          shortcut
        )}. Keys set is already in use by ${existingShortcut}.`
      );
    }
    return true;
  };

  const registerShortcut = (shortcut: ShortcutConfig) => {
    if (shortcutIsValid(shortcut)) {
      const { name, keys, onPress } = shortcut;
      registeredShortcuts.set(name, keys);
      enabledShortcuts.add(name);

      if (onPress) {
        events.on(pressEvent(name), () => onPress());
      }
    }
  };

  const onKeydown = (event: KeyboardEvent) => {
    const key = getUnshiftedKey(event.key) as Key;
    // does adding this key activate shortcut
    const keyActivatedShortcuts = pressTheKey(key);
    if (keyActivatedShortcuts?.length) {
      event.preventDefault();
    }
  };
  const onKeyup = (event: KeyboardEvent) => {
    const key = getUnshiftedKey(event.key) as Key;
    liftTheKey(key);
  };

  const registerShortcuts = (shortcutArr: ShortcutConfig[]) => {
    registeredShortcuts.clear();
    shortcutArr.forEach(registerShortcut);
    [...get(activeShortcuts)].forEach((shortcut) => {
      !registeredShortcuts.has(shortcut) && activeShortcuts.delete(shortcut);
    });
  };

  const mount = () => {
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("keyup", onKeyup);
  };

  const dismount = () => {
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("keyup", onKeyup);
  };

  const enableOnlyShortcuts = (shortcuts: string[]) => {
    enabledShortcuts.clear();
    shortcuts.forEach(enabledShortcuts.add);
  };

  const enableAllShortcuts = () => {
    enabledShortcuts.clear();
    registeredShortcuts.forEach((_, shortcut) => {
      enabledShortcuts.add(shortcut);
    });
  };

  return {
    // Event emitter. Emits events when a Key or shortcut is pressed.
    // Don't name a shortcut the same name as a Key.
    // Keys events are emitted when pressed
    // Shortcut events are emitted when pressed with a "true" payload
    // Shortcut events are emitted when lifted with a "false" payload
    // Also emits "~" when no shortcut is active.
    events,
    // To be called by KeyboardCtrl: Registers the shortcut
    registerShortcuts,
    // To be called by KeyboardCtrl: Adds event listeners
    mount,
    // To be called by KeyboardCtrl: Cleans up event listeners
    dismount,
    // Returns fn to add key
    activeShortcuts,
    enableOnlyShortcuts,
    enableAllShortcuts,
  };
};

// TODO: move to some app state and pass into KeyboardCtrl svelte
export const keyboardInput = KeyboardInput();
