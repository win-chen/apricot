import { DoublyLinkedList } from "@datastructures-js/linked-list";
import { derived, get, writable } from "svelte/store";
import { v4 } from "uuid";
import { writableGraph } from "./writable-graph";

interface LevelNode {
  levelId: string;
  ids: Set<string>;
}

/**
 * Maybe include node data adapter? to add/delete nodes for cluster nodes?
 */
export const clusterer = () => {
  const clusterGraph = writableGraph({ directed: true, compound: true });

  const orderedLevels = new DoublyLinkedList<LevelNode>();
  orderedLevels.insertFirst({
    levelId: v4(),
    ids: new Set(),
  });
  const _cursor = writable(orderedLevels.head());

  const currentLevelIds = derived(_cursor, ($cursor) => $cursor.getValue().ids);

  const _addToLevel = (id: string) => {
    // Add id to the level
    const { ids } = cursor.getValue();
    ids.add(id);

    // Remove id's children from the current level
    const children = clusterGraph.get().children(id);
    children.forEach(ids.delete);
  };

  const _removeFromLevel = (id: string) => {
    const level = cursor.getValue();
    const { ids } = level;

    // Add any children to this level
    const children = clusterGraph.get().children(id);
    children.forEach(ids.add);

    // Remove from level
    ids.delete(id);

    // Remove level if it's the same as the level below it
    if (cursor.hasNext()) {
      const next = cursor.getNext();
      const nextIds = next.getValue().ids;

      if (nextIds.size === ids.size && [...nextIds].every(ids.has)) {
        const prev = cursor;
        cursor = next;
        orderedLevels.remove(prev);
      }
    }
  };
  const cursor = () => get(_cursor);

  const methods = {
    /**
     * Creates a new level in the current cursor position.
     */
    insertLevel: () => {
      const { ids } = cursor().getValue();

      const id = v4();
      _cursor.update((c) =>
        orderedLevels.insertAfter({ levelId: id, ids: new Set([...ids]) }, c)
      );
    },
    insertCluster: (id: string, children: string[]) => {
      clusterGraph.setNodes(children).setParent(children, id).update();

      _addToLevel(id);
    },
    removeCluster: (id: string) => {
      // Update clustering
      const parent = clusterGraph.get().parent(id);
      if (parent) {
        const children = clusterGraph.get().children(id);
        clusterGraph.setParent(children, parent);
      }
      clusterGraph.removeNode(id).update();

      // Update levels
      _removeFromLevel(id);
    },
    levelUp: () => {
      _cursor.update(($cursor) => $cursor.getNext());
    },
    levelDown: () => {
      _cursor.update(($cursor) => $cursor.getPrev());
    },
    currentLevelIds,
  };

  return methods;
};
