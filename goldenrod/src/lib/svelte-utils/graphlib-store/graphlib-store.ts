import { Graph, type GraphOptions } from "@dagrejs/graphlib";
import { get, readonly, writable, type Writable } from "svelte/store";

interface ObjectWithId {
  id: string;
}

type MethodsStartingWithSet<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? K extends `set${infer _}`
      ? K
      : never
    : never;
}[keyof T];

type MethodsStartingWithRemove<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? K extends `remove${infer _}`
      ? K
      : never
    : never;
}[keyof T];

type MutatingMethods =
  | MethodsStartingWithSet<Graph>
  | MethodsStartingWithRemove<Graph>;

type NonMutatingGraph = Omit<Graph, MutatingMethods>;

interface UpdateOptions {
  skipNodes?: boolean;
  skipEdges?: boolean;
}

/**
 * Creates a svelte store for a directed graph
 * @param nodeRecord Reference to a record of nodes. Resulting graph methods like setNode and removeNode will mutate the record to add and remove nodes
 * @param edgeRecord Reference to a record of edge. Resulting graph methods like setNode and removeNode will mutate the record to add and remove edges
 * @returns a svelte store wrapping graphlib's Graph. The mutating methods are
 * replaced so that they call "update". Please note,some/all mutating method signatures have changed
 */
export const createGraph = <N extends ObjectWithId, E extends ObjectWithId>(
  options: GraphOptions = {
    multigraph: false,
    directed: true,
    compound: true,
  }
) => {
  const graph = new Graph(options);

  const nodeRecord: Writable<Record<string, N>> = writable({});
  const edgeRecord: Writable<Record<string, E>> = writable({});

  const mutatingMethods = {
    // Update function. Used for when parents are updated
    // TODO: figure out a better way to update when parent/child relationship is updated
    update: (
      options: UpdateOptions = { skipNodes: false, skipEdges: false }
    ) => {
      if (!options.skipNodes) {
        nodeRecord.set(get(nodeRecord));
      }
      if (!options.skipEdges) {
        edgeRecord.set(get(edgeRecord));
      }
      return graph;
    },
    setNodes: (nodes: N[], parentId?: string) => {
      const record = get(nodeRecord);

      nodes.forEach((node) => {
        graph.setNode(node.id);
        record[node.id] = node;
        if (parentId) {
          graph.setParent(node.id, parentId);
        }
      });

      nodeRecord.set(record);

      return graph;
    },
    setEdges: (edges: Array<{ srcId: string; sinkId: string; edge: E }>) => {
      const record = get(edgeRecord);

      edges.forEach(({ srcId, sinkId, edge }) => {
        graph.setEdge(srcId, sinkId, edge.id);
        record[edge.id] = edge;
      });

      edgeRecord.set(record);

      return graph;
    },
    setParent: graph.setParent.bind(graph),
    /**
     * Add node to graph
     * @param id node id
     * @param node data of the node to be added
     * @returns graph
     */
    setNode: (id: string, node: N, parentId?: string) => {
      graph.setNode(id);
      if (parentId) {
        graph.setParent(id, parentId);
      }
      nodeRecord.update((record) => {
        record[id] = node;
        return record;
      });
      return graph;
    },
    /**
     * Add edge to graph
     * @param srcId source id of edge
     * @param sinkId sink id of edge
     * @param edge data of edge to be added
     * @returns graph
     */
    setEdge: (srcId: string, sinkId: string, edge: E) => {
      graph.setEdge(srcId, sinkId, edge.id);
      edgeRecord.update((record) => {
        record[edge.id] = edge;
        return record;
      });
      return graph;
    },
    /**
     *
     * @param id Id of node to remove
     * @returns { graph, edges } where edges is an array of graphlib Edges
     * that have been removed. Edge id is set on graphlib.Edge.name
     */
    removeNode: (id: string) => {
      const edges = graph.nodeEdges(id) || [];

      // Remove from records
      edgeRecord.update((record) => {
        edges.forEach((edge) => {
          delete record[graph.edge(edge)];
        });
        return record;
      });

      nodeRecord.update((record) => {
        delete record[id];
        return record;
      });

      // Remove from graph
      graph.removeNode(id);

      return {
        graph,
        edges,
      };
    },
    /**
     *
     * @param srcId source id of edge
     * @param sinkId sink id of edge
     * @returns graph
     */
    removeEdge: (srcId: string, sinkId: string, edgeId: string) => {
      graph.removeEdge({ v: srcId, w: sinkId });
      edgeRecord.update((record) => {
        delete record[edgeId];
        return record;
      });
      return graph;
    },
  };

  return {
    state: graph as NonMutatingGraph,
    ...mutatingMethods,
    nodes: readonly(nodeRecord),
    edges: readonly(edgeRecord),
  };
};

export type GraphStore<
  N extends ObjectWithId = ObjectWithId,
  E extends ObjectWithId = ObjectWithId
> = ReturnType<typeof createGraph<N, E>>;
