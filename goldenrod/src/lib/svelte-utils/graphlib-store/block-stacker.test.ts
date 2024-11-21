import type { Position, Positionable, Rectangle } from "src/types/positionable";
import { get, writable } from "svelte/store";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  blockStacker,
  type BlockStacker,
  type StackingFunction,
} from "./block-stacker";

const mockAdapter = () => {
  const positionables: Record<string, Positionable> = {};

  return {
    createPositionable: (id: string) => {
      const position = writable({ x: 0, y: 0 });
      const dimensions = writable({ width: 10, height: 10 });

      const positionable: Positionable = {
        position,
        dimensions,
      };

      positionables[id] = positionable;
      return positionable;
    },
    getPositionable: (id: string) => {
      if (!positionables[id]) {
        throw new Error(`No positionable found for id ${id}`);
      }
      return positionables[id];
    },
  };
};

const carouselDiagonal: StackingFunction = (
  stackPos: Position,
  index: number,
  _?: Rectangle
) => {
  return {
    x: stackPos.x + index * 10,
    y: stackPos.y + index * 10,
  };
};

const verticalStack: StackingFunction = (
  stackPos: Position,
  _: number,
  prevPos?: Rectangle
) => {
  return {
    x: stackPos.x,
    y: prevPos ? prevPos.y + prevPos.height : stackPos.y,
  };
};

describe("blockStacker", () => {
  let adapter: ReturnType<typeof mockAdapter>;
  let stacker: BlockStacker;

  beforeEach(() => {
    adapter = mockAdapter();
    const { getPositionable } = adapter;
    stacker = blockStacker({ getPositionable });
  });

  it("should add a stack and initialize with children", () => {
    const stackingFn: StackingFunction = vi
      .fn()
      .mockImplementation(carouselDiagonal);

    const child1 = adapter.createPositionable("child1");
    const child2 = adapter.createPositionable("child2");
    const stack = adapter.createPositionable("stack1");

    stacker.addStack("stack1", ["child1", "child2"], stackingFn);

    expect(get(stack.position)).toEqual({ x: 0, y: 0 });
    expect(get(stack.dimensions)).toEqual({
      width: 20,
      height: 20,
    });
    expect(get(stacker.readonlyChildren("stack1"))).toEqual([
      "child1",
      "child2",
    ]);
  });

  it("should update stack and children when stacking function changes", () => {
    const stackingFn: StackingFunction = vi
      .fn()
      .mockImplementation(carouselDiagonal);

    const child1 = adapter.createPositionable("child1");
    const child2 = adapter.createPositionable("child2");
    const stack = adapter.createPositionable("stack1");

    stacker.addStack("stack1", ["child1", "child2"], stackingFn);

    const stackingFn2: StackingFunction = vi
      .fn()
      .mockImplementation(verticalStack);

    stacker.setStackingFn("stack1", stackingFn2);

    expect(get(child1.position)).toEqual({ x: 0, y: 0 });
    expect(get(child2.position)).toEqual({ x: 0, y: 10 });
    expect(get(stack.position)).toEqual({ x: 0, y: 0 });
    expect(get(stack.dimensions)).toEqual({ width: 10, height: 20 });
  });

  it("should update stack and children when children are added", () => {
    const stackingFn: StackingFunction = vi
      .fn()
      .mockImplementation(verticalStack);

    const child1 = adapter.createPositionable("child1");
    const child2 = adapter.createPositionable("child2");
    const stack = adapter.createPositionable("stack1");

    stacker.addStack("stack1", ["child2"], stackingFn);

    expect(get(stack.position)).toEqual({ x: 0, y: 0 });
    expect(get(stack.dimensions)).toEqual({ width: 10, height: 10 });

    stacker.insertToStack("stack1", ["child1"], 0);

    expect(stacker.getIndex("child1")).toBe(0);
    expect(get(stack.position)).toEqual({ x: 0, y: 0 });
    expect(get(stack.dimensions)).toEqual({ width: 10, height: 20 });
    expect(get(child1.position)).toEqual({ x: 0, y: 0 });
    expect(get(child2.position)).toEqual({ x: 0, y: 10 });
  });

  it("should update stack and children when children are removed", () => {
    const stackingFn: StackingFunction = vi
      .fn()
      .mockImplementation(verticalStack);

    const child1 = adapter.createPositionable("child1");
    const child2 = adapter.createPositionable("child2");
    const stack = adapter.createPositionable("stack1");

    stacker.addStack("stack1", ["child1", "child2"], stackingFn);

    stacker.removeFromStack("child1");

    expect(stacker.getIndex("child2")).toBe(0);
    expect(get(stack.position)).toEqual({ x: 0, y: 0 });
    expect(get(stack.dimensions)).toEqual({ width: 10, height: 10 });
    expect(get(child2.position)).toEqual({ x: 0, y: 0 });
  });

  it("should update children when stack is moved", () => {
    const stackingFn: StackingFunction = vi
      .fn()
      .mockImplementation(verticalStack);

    const child1 = adapter.createPositionable("child1");
    const child2 = adapter.createPositionable("child2");
    const stack = adapter.createPositionable("stack1");

    stacker.addStack("stack1", ["child1", "child2"], stackingFn);

    stack.position.set({ x: 100, y: 100 });

    expect(get(child1.position)).toEqual({ x: 100, y: 100 });
    expect(get(child2.position)).toEqual({ x: 100, y: 110 });
  });

  it("should destroy stacks", () => {
    const stackingFn: StackingFunction = vi
      .fn()
      .mockImplementation(verticalStack);

    adapter.createPositionable("child1");
    adapter.createPositionable("child2");
    adapter.createPositionable("stack1");

    stacker.addStack("stack1", ["child1", "child2"], stackingFn);

    stacker.destroyStack("stack1");

    expect(stacker.getStack("child1")).toBeUndefined();
    expect(stacker.getStack("child2")).toBeUndefined();
  });
});
