import { Graph, type GraphOptions } from "@dagrejs/graphlib";
import { get, writable } from "svelte/store";

interface Edge {
  src: string;
  target: string;
  edgeId?: string;
}

/**
 * Creates a svelte store for a directed graph
 * @returns a svelte store wrapping graphlib's Graph
 */
export const writableGraph = (
  options: GraphOptions = {
    multigraph: false,
    directed: true,
    compound: false,
  }
) => {
  const graph = new Graph(options);
  const store = writable(graph);

  const methods = {
    setNode: (id: string) => {
      graph.setNode(id);
      return result;
    },
    setNodes: (ids: string[]) => {
      ids.forEach((id) => graph.setNode(id));
      return result;
    },
    setEdge: (src: string, target: string, edgeId: string) => {
      graph.setEdge(src, target, edgeId);
      return result;
    },
    setEdges: (edges: Array<Edge>) => {
      edges.forEach(({ src, target, edgeId }) => {
        graph.setEdge(src, target, edgeId);
      });
      return result;
    },
    setParent: (child: string | string[], parent?: string) => {
      if (Array.isArray(child)) {
        child.forEach((node) => graph.setParent(node, parent));
      } else {
        graph.setParent(child, parent);
      }
      return result;
    },
    removeNode: (id: string) => {
      graph.removeNode(id);
      return result;
    },
    removeEdge: (src: string, target: string, edgeId?: string) => {
      const edge = {
        v: src,
        w: target,
        name: graph.isMultigraph() ? edgeId : undefined,
      };

      graph.removeEdge(edge);
      return result;
    },
    get: () => get(store),
    update: () => store.set(graph),
  };

  const result = {
    ...store,
    ...methods,
  };

  return result;
};

export type WritableGraph = ReturnType<typeof writableGraph>;
