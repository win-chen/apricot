import type { Position, Positionable, Rectangle } from "src/types/positionable";
import {
  get,
  readonly,
  writable,
  type Readable,
  type Writable,
} from "svelte/store";

function insertArrayAtIndex<T>(
  mainArray: T[],
  insertArray: T[],
  index: number
): T[] {
  // Ensure the index is within bounds
  if (index < 0 || index > mainArray.length) {
    throw new Error("Index out of bounds");
  }

  // Create a new array to hold the result
  const result = [...mainArray];

  // Insert the insertArray at the specified index
  result.splice(index, 0, ...insertArray);

  return result;
}

export interface BlockStacker {
  addStack: (
    stackId: string,
    children: string[],
    stackingFunction: StackingFunction
  ) => void;
  destroyStack: (id: string) => void;
  insertToStack: (stackId: string, ids: string[], index?: number) => void;
  removeFromStack: (id: string) => void;
  setStackingFn: (stackId: string, fn: StackingFunction) => void;
  readonlyChildren: (id: string) => Readable<string[]>;
  getStack: (childId: string) => string | undefined;
  getIndex: (childId: string) => number;
}

export type StackingFunction = (
  stackPos: Position,
  index: number,
  prevPos?: Rectangle
) => Position;

interface StackNode {
  stackingFn: Writable<StackingFunction>;
  children: Writable<string[]>;
}

/**
 * https://tinyurl.com/4zfypxxe
 * BlockStack is an ordered collection of some object that has positioning and
 * dimensions. The BlockStack's dimensions is determined by its contents.
 * The BlockStack's position is determined by the first item in the stack.
 * Repositioning a BlockStack repositions its items.
 * BlockStack holds a reference to a positioning function which determines
 * how the 1..N items are positioned relative to the first item.
 * An item can be inserted into any part of the BlockStack.
 */
export const blockStacker = (adapter: {
  getPositionable: (id: string) => Positionable;
}): BlockStacker => {
  const stackTree = new Map<string, StackNode>();
  const childToStackId = new Map<
    string /** childId */,
    string /** parentId */
  >();

  // Move this to some util
  const getBoundingRect = (rects: Positionable[]): Rectangle => {
    // Handle empty array case
    if (rects.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    // Initialize with first rect's values
    const { position, dimensions } = rects[0];
    const { x, y } = get(position);
    const { width, height } = get(dimensions);

    let minX = x;
    let minY = y;
    let maxX = minX + width;
    let maxY = minY + height;

    // Iterate through remaining rects
    for (let i = 1; i < rects.length; i++) {
      const { position, dimensions } = rects[i];
      const pos = get(position);
      const dims = get(dimensions);

      // Update min X
      minX = Math.min(minX, pos.x);

      // Update min Y
      minY = Math.min(minY, pos.y);

      // Update max X
      maxX = Math.max(maxX, pos.x + dims.width);

      // Update max Y
      maxY = Math.max(maxY, pos.y + dims.height);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  const _getNode = (id: string) => {
    const node = stackTree.get(id);
    if (!node) {
      throw new Error(`Unable to find stack node for id ${id}`);
    }
    return node;
  };

  const _getStackingFn = (id: string): StackingFunction => {
    const node = _getNode(id);
    return get(node.stackingFn);
  };

  const _updateChildPositions = (stackId: string) => {
    const node = _getNode(stackId);

    const rects = get(node.children).map(adapter.getPositionable);
    if (!rects.length) {
      return;
    }

    const stackPosition = get(adapter.getPositionable(stackId).position);

    const stackingFn = _getStackingFn(stackId);
    let prevRect: Rectangle | undefined = undefined;
    rects.forEach((rect, index) => {
      const update = stackingFn(stackPosition, index, prevRect);
      rects[index].position.set(update);
      const { width, height } = get(rect.dimensions);
      prevRect = { ...update, width, height };
    });
  };
  const _updateStackDimensions = (stackId: string) => {
    const node = _getNode(stackId);

    const rects = get(node.children).map(adapter.getPositionable);
    if (!rects.length) {
      return;
    }
    const { x, y, width, height } = getBoundingRect(rects);
    const stack = adapter.getPositionable(stackId);
    stack.position.set({ x, y });
    stack.dimensions.set({ width, height });
  };

  const methods = {
    // Creates, inits, and returns a stack object
    // TODO: maybe StackingFunction should be enum
    addStack: (
      stackId: string,
      children: string[],
      stackingFunction: StackingFunction
    ) => {
      const treeNode = {
        children: writable([]),
        stackingFn: writable(stackingFunction),
      };
      stackTree.set(stackId, treeNode);
      methods.insertToStack(stackId, children, 0);

      // Initialize stack position based on first child
      const stack = adapter.getPositionable(stackId);
      const { position } = adapter.getPositionable(children[0]);
      stack.position.set(get(position));

      // On move, update child positions
      stack.position.subscribe(() => _updateChildPositions(stackId));
      // On stacking fn change, update child positions
      treeNode.stackingFn.subscribe(() => {
        _updateChildPositions(stackId);
        _updateStackDimensions(stackId);
      });
      // On children-change, update stack dimensions and positions
      treeNode.children.subscribe(() => {
        _updateChildPositions(stackId);
        _updateStackDimensions(stackId);
      });
    },
    destroyStack: (id: string) => {
      // delete from parents
      const children = get(_getNode(id).children);
      // delete from tree first to not run subscription fns
      stackTree.delete(id);
      children.map((id) => childToStackId.delete(id));
    },
    // Inserts id into the stack
    insertToStack: (stackId: string, ids: string[], index = 0) => {
      const node = _getNode(stackId);

      node.children.update(($children) => {
        const update = insertArrayAtIndex($children, ids, index);
        update.forEach((id) => childToStackId.set(id, stackId));
        return update;
      });
    },
    removeFromStack: (id: string) => {
      const stackId = childToStackId.get(id);
      if (!stackId) {
        throw new Error(`No stack parent found for id ${id}`);
      }

      const { children } = _getNode(stackId);
      children.update(($children) =>
        $children.filter((child) => !(child == id))
      );
      childToStackId.delete(id);
    },
    setStackingFn: (stackId: string, fn: StackingFunction) => {
      const node = _getNode(stackId);
      node.stackingFn.set(fn);
    },
    readonlyChildren: (id: string) => {
      const node = _getNode(id);
      return readonly(node.children);
    },
    getStack: (childId: string) => {
      return childToStackId.get(childId);
    },
    getIndex: (childId: string) => {
      const parent = methods.getStack(childId);
      if (!parent) {
        throw new Error(`No parent found for ${childId}`);
      }
      const node = _getNode(parent);
      return get(node.children).indexOf(childId);
    },
  };

  return methods;
};
