/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ConfigList } from "./types";
import { userInteractionTracker } from "./user-input-tracker";
import { writable } from "svelte/store";
import dot from "graphlib-dot";

type EventTarget = Element | Document | Window;

// TODO: move to test utils
// Helper to create keyboard event options
const createKeyboardEventInit = (
  key: string,
  options: Partial<KeyboardEventInit> = {}
): KeyboardEventInit => ({
  key,
  code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
  bubbles: true,
  cancelable: true,
  ...options,
});

// TODO: move to test utils
// Main keyboard event dispatcher
export const dispatchKeyboardEvent = (
  target: EventTarget,
  eventType: "keydown" | "keyup" | "keypress",
  key: string,
  options: Partial<KeyboardEventInit> = {}
) => {
  const eventInit = createKeyboardEventInit(key, options);
  const event = new KeyboardEvent(eventType, eventInit);
  target.dispatchEvent(event);
  return event;
};

describe("user input tracker", () => {
  it("destroys", () => {
    const configList: ConfigList<{}> = {
      enter: {
        input: ["A", "B"],
        onEnter: vi.fn(),
      },
    };

    const { enter } = configList;

    const tracker = userInteractionTracker({});
    tracker.init(window.document);
    tracker.register(configList);

    tracker.destroy(window.document);

    dispatchKeyboardEvent(window.document, "keydown", "A");
    expect(enter.onEnter).not.toHaveBeenCalled();
    dispatchKeyboardEvent(window.document, "keydown", "B");
    expect(enter.onEnter).not.toHaveBeenCalled();
  });

  it("activates actions on enter", () => {
    const configList: ConfigList<{}> = {
      enter: {
        input: ["A", "B"],
        onEnter: vi.fn(),
      },
    };
    const { enter } = configList;

    const tracker = userInteractionTracker({});
    tracker.init(window.document);
    tracker.register(configList);

    dispatchKeyboardEvent(window.document, "keydown", "A");
    expect(enter.onEnter).not.toHaveBeenCalled();
    dispatchKeyboardEvent(window.document, "keydown", "B");
    expect(enter.onEnter).toHaveBeenCalledOnce();

    tracker.destroy(window.document);
  });

  it("activates actions on leave", () => {
    const configList: ConfigList<{}> = {
      exit: {
        input: ["A", "C"],
        onLeave: vi.fn(),
      },
    };
    const { exit } = configList;

    const tracker = userInteractionTracker({});
    tracker.init(window.document);
    tracker.register(configList);

    dispatchKeyboardEvent(window.document, "keydown", "A");
    expect(exit.onLeave).not.toHaveBeenCalled();
    dispatchKeyboardEvent(window.document, "keydown", "C");
    expect(exit.onLeave).not.toHaveBeenCalled();
    dispatchKeyboardEvent(window.document, "keyup", "A");
    expect(exit.onLeave).toHaveBeenCalledOnce();
  });

  it("prevents default when an action has been activated", () => {
    const configList: ConfigList<{}> = {
      enter: {
        input: ["A", "B"],
        onEnter: vi.fn(),
      },
    };
    const { enter } = configList;

    const tracker = userInteractionTracker({});
    tracker.init(window.document);
    tracker.register(configList);

    dispatchKeyboardEvent(window.document, "keydown", "A");
    expect(enter.onEnter).not.toHaveBeenCalled();
    const event = dispatchKeyboardEvent(window.document, "keydown", "B");
    expect(enter.onEnter).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it("supports custom inputs", () => {
    const elementHovered = writable(false);

    const customInput = { element_hovered: elementHovered } as const;
    const configList: ConfigList<typeof customInput> = {
      enter: {
        input: ["element_hovered", "B"],
        onEnter: vi.fn(),
      },
    };
    const { enter } = configList;

    const tracker = userInteractionTracker(customInput);
    tracker.init(window.document);
    tracker.register(configList);

    elementHovered.set(true);
    expect(enter.onEnter).not.toHaveBeenCalled();
    dispatchKeyboardEvent(window.document, "keydown", "B");
    expect(enter.onEnter).toHaveBeenCalledOnce();
  });

  it("supports unordered inputs", () => {
    const elementHovered = writable(false);

    const customInput = { element_hovered: elementHovered } as const;
    const configList: ConfigList<typeof customInput> = {
      enter: {
        input: [["element_hovered", "B"]],
        onEnter: vi.fn(),
      },
    };
    const { enter } = configList;

    const tracker = userInteractionTracker(customInput);
    tracker.init(window.document);
    tracker.register(configList);

    dispatchKeyboardEvent(window.document, "keydown", "B");
    expect(enter.onEnter).not.toHaveBeenCalled();
    elementHovered.set(true);
    expect(enter.onEnter).toHaveBeenCalledOnce();
  });

  it("supports 'not' inputs", () => {
    const elementHovered = writable(false);

    const customInput = { element_hovered: elementHovered } as const;
    const configList: ConfigList<typeof customInput> = {
      enter: {
        input: ["not:element_hovered", "B"],
        onEnter: vi.fn(),
      },
    };
    const { enter } = configList;

    const tracker = userInteractionTracker(customInput);
    tracker.init(window.document);
    tracker.register(configList);

    console.log(tracker.activeLeaves);
    console.log(dot.write(tracker.inputTrie));

    expect(enter.onEnter).not.toHaveBeenCalled();
    // Only press B because element_hovered is already false
    dispatchKeyboardEvent(window.document, "keydown", "B");
    expect(enter.onEnter).toHaveBeenCalledOnce();
  });

  it("supports CLICK and passes click event actions ending with CLICK input", () => {
    const configList: ConfigList<{}> = {
      enter: {
        input: ["A", "CLICK"],
        onEnter: vi.fn(),
      },
    };
    const { enter } = configList;

    const tracker = userInteractionTracker({});
    tracker.init(window.document);
    tracker.register(configList);

    dispatchKeyboardEvent(window.document, "keydown", "A");
    expect(enter.onEnter).not.toHaveBeenCalled();
    const event = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });
    window.document.dispatchEvent(event);
    expect(enter.onEnter).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });
});
