import { DoublyLinkedList } from "@datastructures-js/linked-list";
import { get, readonly, writable } from "svelte/store";
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
  const cursor = () => get(_cursor);

  const _currentLevelIds = writable(new Set<string>());
  const currentLevelIds = readonly(_currentLevelIds);
  _cursor.subscribe(($cursor) => {
    _currentLevelIds.set($cursor.getValue().ids);
  });

  const _addToLevel = (id: string, level?: LevelNode) => {
    // Add id to the level
    const { ids } = level || cursor().getValue();
    ids.add(id);

    // Remove id's children from the current level
    const children = clusterGraph.get().children(id);
    children.forEach((id) => ids.delete(id));
  };

  const _removeFromLevel = (id: string) => {
    const level = cursor().getValue();
    const { ids } = level;

    // Add children of node to this level
    const children = clusterGraph.get().children(id);
    children.forEach((id) => ids.add(id));

    // Remove from level
    ids.delete(id);

    // Remove level if it's the same as the level below it
    if (cursor().hasPrev()) {
      const prev = cursor().getPrev();
      const prevIds = prev.getValue().ids;

      if (
        prevIds.size === ids.size &&
        [...prevIds].every((id) => ids.has(id))
      ) {
        _cursor.update((curr) => {
          orderedLevels.remove(curr);
          return prev;
        });
      }
    }
  };

  /**
   * Creates a new level in the current cursor position.
   */
  const _insertLevel = () => {
    const { ids } = cursor().getValue();

    const id = v4();
    _cursor.update((c) =>
      orderedLevels.insertAfter({ levelId: id, ids: new Set([...ids]) }, c)
    );
  };

  const methods = {
    addNodes: (children: string[]) => {
      if (children.some((child) => clusterGraph.get().hasNode(child))) {
        throw new Error(
          `Nodes added to clusterer must be unique. Duplicate nodes ${children.filter(
            (child) => clusterGraph.get().hasNode(child)
          )}`
        );
      }
      clusterGraph.setNodes(children).update();
      children.forEach((id) =>
        orderedLevels.forEach((level) => _addToLevel(id, level.getValue()))
      );
    },
    // Inserts a cluster to the current level
    // If the level is the lowest level, it creates a new level
    // If the children are not on the previous level, throws an error
    insertCluster: (id: string, children: string[]) => {
      // Insert level if clustering on the lowest level
      if (cursor() === orderedLevels.head()) {
        _insertLevel();
      }

      const availableIds = get(currentLevelIds);
      if (!children.every((id) => availableIds.has(id))) {
        throw new Error(
          `Error inserting cluster - at least one of the clustered ids not available for clustering: ${children}`
        );
      }

      // Insert level if clustering all items on the level
      if (children.length === availableIds.size) {
        _insertLevel();
      }

      clusterGraph.setNodes(children).setParent(children, id).update();
      _addToLevel(id);
    },
    removeCluster: (id: string) => {
      if (!get(currentLevelIds).has(id)) {
        throw new Error(`Error removing cluster, id ${id} not in view`);
      }

      // Update levels
      _removeFromLevel(id);

      // Update clustering
      const parent = clusterGraph.get().parent(id);
      if (parent) {
        const children = clusterGraph.get().children(id);
        clusterGraph.setParent(children, parent);
      }
      clusterGraph.removeNode(id).update();
    },
    levelUp: () => {
      if (cursor().hasNext()) {
        _cursor.update(($cursor) => $cursor.getNext());
      }
    },
    levelDown: () => {
      if (cursor().hasPrev()) {
        _cursor.update(($cursor) => $cursor.getPrev());
      }
    },
    currentLevelIds,
  };

  return methods;
};
