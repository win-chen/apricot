import { derived, get, writable } from "svelte/store";
import type { GraphStore } from "../lib/svelte-utils/graphlib-store/graphlib-store";
import {
  dijkstraHelper,
  edgeToPixiEdge,
  getRandomColor,
  nodesAreConnected,
} from "src/state/utils";
import { nodeToPixiNode } from "src/state/nodes";
import { EdgeLabel, type PixiEdge, type PixiNode } from "src/state/types";
import { graph } from "./state";
import { getEdgeNodes } from "./utils";

export const withClusters = (graph: GraphStore<PixiNode, PixiEdge>) => {
  const clusterZoomLevel = writable<number>(1);
  const maxZoomLevel = writable<number>(1);
  const RENDER_ROOT_ID = "root";

  const UNCLUSTERED_ID = "unclustered";

  const opacityFilter = 0.3;

  /** Possibly used to rerender nodesInView when inserting new cluster layer */
  const opacityRerenderBit = writable(false);

  const lightenOpacityByLayer = (level: number, node: PixiNode) => {
    node.ui.opacity.update((opacity) =>
      Math.min(0, opacity - opacityFilter * level)
    );
  };

  /**
   * Nodes in the cluster level
   */
  const clusteredNodes = derived(
    [clusterZoomLevel, graph.nodes],
    ([$clusterZoomLevel, $nodes]) => {
      return nodesAtTreeLevel($clusterZoomLevel, [RENDER_ROOT_ID])
        .map((id) => {
          return $nodes[id];
        })
        .filter((node) => !!node);
    }
  );

  /**
   * Edges in the cluster level
   */
  const clusteredEdges = derived(
    [clusteredNodes, graph.edges],
    ([$nodes, $allEdges]) => {
      return Object.values($allEdges).filter((edge) => {
        const { src, dest } = getEdgeNodes(graph, edge.id);

        return (
          $nodes.filter((node) => node.id == src || node.id == dest).length == 2
        );
      });
    }
  );

  const getUnclusteredNodes = () => graph.state.children(UNCLUSTERED_ID) || [];
  const unclusteredNodeIds = writable(getUnclusteredNodes());
  const unclusteredNodes = derived(
    [unclusteredNodeIds, graph.nodes],
    ([ids, nodes]) => ids.map((id) => nodes[id]).filter((node) => !!node)
  );

  /**
   * Edges in the cluster level
   */
  const unclusteredEdges = derived(
    [unclusteredNodes, graph.edges],
    ([$nodes, $allEdges]) => {
      return Object.values($allEdges).filter((edge) => {
        const { src, dest } = getEdgeNodes(graph, edge.id);

        return (
          $nodes.filter((node) => node.id == src || node.id == dest).length == 2
        );
      });
    }
  );

  const nodesInView = derived(
    [clusteredNodes, unclusteredNodes],
    ([$clusteredNodes, $unclustered]) => {
      return [...$clusteredNodes, ...$unclustered];
    }
  );

  const edgesInView = derived([clusteredEdges, unclusteredEdges], ([a, b]) => [
    ...a,
    ...b,
  ]);

  /**
   * Removes all clusters above it in the render tree
   * @param clusterNodeIds - ids of nodes in the cluster. The nodes should have a parent relationship with nodes in the current view
   */
  function insertClusterLevel(clusters: string[][]) {
    // Color and make all cluster nodes
    const clusterNodes: Array<PixiNode> = [];
    clusters.forEach((cluster: string[]) => {
      const color = getRandomColor();

      const firstNode = get(graph.nodes)[cluster[0]];

      const clusterNode = nodeToPixiNode({
        id: color,
        text: get(firstNode.attr.text),
        x: get(firstNode.attr.x),
        y: get(firstNode.attr.y),
      });
      clusterNode.ui.color.set(color);
      clusterNodes.push(clusterNode);

      graph.setNode(clusterNode.id, clusterNode);

      cluster
        .filter((id) => id !== RENDER_ROOT_ID)
        .forEach((id) => {
          const node = get(graph.nodes)[id];
          node.ui.color.set(color);
          graph.setParent(id, clusterNode.id);
          applyFnToAllDescendents(id, (childId) => {
            const node = get(graph.nodes)[childId];
            node.ui.color.set(color);
          });
        });
    });

    // Make edges to connected cluster nodes
    const djikstra = dijkstraHelper();
    for (let i = 0; i < clusterNodes.length; i++) {
      for (let j = i + 1; j < clusterNodes.length; j++) {
        const id1 = clusterNodes[i].id;
        const id2 = clusterNodes[j].id;
        if (
          djikstra.subgraphsAreConnected(id1, id2) &&
          !nodesAreConnected(id1, id2)
        ) {
          const pixiEdge = edgeToPixiEdge({
            source: id1,
            target: id2,
            label: EdgeLabel.LINKED,
          });
          graph.setEdge(id1, id2, pixiEdge);
        }
      }
    }

    clusterNodes.map((node) => graph.setParent(node.id, RENDER_ROOT_ID));
    maxZoomLevel.update((level) => level + 1);
    // Set value to trigger filterNodes update
    clusterZoomLevel.update((level) => level + 1);
  }

  function clusterZoomIn() {
    clusterZoomLevel.update((level) =>
      level < get(maxZoomLevel) ? level + 1 : level
    );
  }

  function clusterZoomOut() {
    // Go up the tree
    clusterZoomLevel.update((level) => (level > 1 ? level - 1 : level));
  }

  function nodesAtTreeLevel(
    level: number,
    currentLevelIds: string[] = [RENDER_ROOT_ID]
  ): string[] {
    if (level == 0) {
      return currentLevelIds;
    }
    const nodeIds = currentLevelIds
      .map((id) => graph.state.children(id) || [])
      .flat();
    return nodesAtTreeLevel(level - 1, nodeIds);
  }
  /**
   * Level order traversal, applying function to tree
   * @param fn - function to run on each node at the tree level
   * @param currentLevelIds
   * @param currentLevel
   * @param maxLevel
   * @returns
   */
  function applyFnToTreeLevel(
    fn: (level: number, item: PixiNode) => void,
    currentLevelIds: string[] = [RENDER_ROOT_ID],
    currentLevel = 0,
    maxLevel?: number
  ): string[] {
    if (currentLevel === maxLevel) {
      return currentLevelIds;
    }
    const nodeIds = currentLevelIds
      .map((id) => graph.state.children(id) || [])
      .flat();
    return applyFnToTreeLevel(fn, nodeIds, currentLevel + 1, maxLevel);
  }

  function applyFnToAllDescendents(rootId: string, fn: (id: string) => void) {
    const children = graph.state.children(rootId) || [];
    children.forEach((id) => {
      fn(id);
      applyFnToAllDescendents(id, fn);
    });
  }

  function setNodeUnclustered(id: string, node: PixiNode) {
    graph.setNode(id, node, UNCLUSTERED_ID);
    unclusteredNodeIds.set(getUnclusteredNodes());
  }
  function setNodesUnclustered(nodes: PixiNode[]) {
    graph.setNodes(nodes, UNCLUSTERED_ID);
    unclusteredNodeIds.set(getUnclusteredNodes());
  }

  return {
    clusterZoomLevel,
    maxZoomLevel,
    nodesInView,
    edgesInView,
    ...graph,
    setNodesUnclustered,
    setNodeUnclustered,
    applyFnToAllDescendents,
    applyFnToTreeLevel,
    nodesAtTreeLevel,
    clusterZoomIn,
    clusterZoomOut,
    insertClusterLevel,
  };
};
