/**
 * This is a "trie" for paths. A path is a subset of an input sequence
* Example:
https://edotor.net/?engine=dot#%0A%23%20Path%3A%20%5B%5BE%2C%20A%5D%2C%20C%5D%0A%0Astrict%20digraph%20%7B%0A%20%20R%20-%3E%20%22R%2FE%22%0A%20%20R%20-%3E%20%22R%2FA%22%0A%20%20%22R%2FE%22%20-%3E%20%22R%2FE%2FA%22%0A%20%20%22R%2FA%22%20-%3E%20%22R%2FA%2FE%22%0A%20%20%22R%2FE%2FA%22%20-%3E%20%22R%2FE%2FA%2FC%22%0A%20%20%22R%2FA%2FE%22%20-%3E%20%22R%2FA%2FE%2FC%22%0A%0A%20%20%22shortcutA%22%20-%3E%20%7B%0A%20%20%20%20%20%20%22R%2FE%2FA%2FC%22%0A%20%20%20%20%20%20%22R%2FA%2FE%2FC%22%0A%20%20%7D%0A%0A%20%20%22shortcutB%22%20-%3E%20%7B%0A%20%20%20%20%20%20%22R%2FE%2FA%22%0A%20%20%7D%0A%7D%0A%0A
*/

import type { Graph } from "@dagrejs/graphlib";
import { getAllPermutations } from "./utils";

export const DELIMITER = "/";

export const getPrecedingPath = (pathNode: string) => {
  const prevPath = pathNode.split(DELIMITER);
  prevPath.pop();
  return prevPath.join(DELIMITER);
};

export const getNonPathPredecessors = (graph: Graph, pathNode: string) => {
  const parent = getPrecedingPath(pathNode);
  return (graph.predecessors(pathNode) || []).filter((name) => name !== parent);
};

/**
 * Type K is the valid parts of the path
 * Used to create a path "search tree"
 * @param graph Graph({ directed: true }) to write to
 * @param elements An array representing an ordered path. Nested arrays represent unordered path, which effectively means a path will be created for each permutation of the array
 * @param rootNode name of root node
 * @returns Resulting leaves when writing the path to the tree
 */
export const writePathTrie = <K extends string>(
  graph: Graph,
  elements: (K | K[])[],
  rootNode = "_"
) => {
  type T = (K | K[])[];

  if (!graph.hasNode(rootNode)) {
    graph.setNode(rootNode);
  }

  const leaves: string[] = [];

  const appendToGraph = (path: string, element: string) => {
    const currentPath = `${path}${DELIMITER}${element}`;
    if (!graph.hasNode(currentPath)) {
      graph.setNode(currentPath);
    }
    if (!graph.hasEdge(path, currentPath)) {
      graph.setEdge(path, currentPath);
    }
    return currentPath;
  };

  const processPaths = (graph: Graph, arr: T, prevPath: string) => {
    if (arr.length === 0) {
      leaves.push(prevPath);
      return;
    }

    const arrayOrElement = arr.shift();

    if (Array.isArray(arrayOrElement)) {
      const permutations = getAllPermutations<K>(arrayOrElement);
      permutations.forEach((permutation) => {
        const splitOff = (permutation as T).concat([...arr]);
        processPaths(graph, splitOff, prevPath);
      });
    } else {
      const currentPath = appendToGraph(prevPath, arrayOrElement!);
      processPaths(graph, arr, currentPath);
    }
  };

  processPaths(graph, [...elements], rootNode);

  return leaves;
};

export const deletePathFromSearchTree = (graph: Graph, pathNode: string) => {
  if (
    !graph.hasNode(pathNode) ||
    // pathNode is part of another path, do not delete
    (graph.successors(pathNode) || []).length ||
    // pathNode is linked to a non-pathNode, do not delete
    (graph.predecessors(pathNode) || []).length > 1
  ) {
    return;
  }

  const parentPathNode = getPrecedingPath(pathNode);

  graph.removeNode(pathNode);
  deletePathFromSearchTree(graph, parentPathNode);
};
/**
 * Bubbles up the search tree running the cb
 * @param graph graph containing the search tree
 * @param startNode bubbles up from this node - INCLUSIVE, runs callback on the node
 * @param cb Return null from the callback to cancel remaining bubbling
 * @param endNode stops at this node - INCLUSIVE, runs callback on the node
 */
export const bubble = (
  graph: Graph,
  startNode: string,
  cb: (...args: any[]) => void | null,
  endNode: string
): void => {
  if (!graph.hasNode(startNode)) {
    return;
  }

  const result = cb(startNode);

  if (result === null || startNode === endNode) {
    return;
  }

  const parent = getPrecedingPath(startNode);

  bubble(graph, parent, cb, endNode);
};

/**
 * Cascades down the search tree running the callback
 * @param graph graph containing the search tree
 * @param startNode cascades down from this node - INCLUSIVE
 * @param cb
 * @param endNode stops cascading at this node - INCLUSIVE
 */
export const cascade = (
  graph: Graph,
  startNode: string,
  cb: (...args: any[]) => void | null,
  endNode: string
) => {
  if (!graph.hasNode(startNode)) {
    return;
  }

  cb(startNode);

  if (startNode === endNode) {
    return;
  }
};
