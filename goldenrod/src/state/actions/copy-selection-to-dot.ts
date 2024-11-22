import { Graph } from "@dagrejs/graphlib";
import dot from "graphlib-dot";
import { deepUnwrap } from "src/lib/svelte-utils/deep-unwrap";
import type { GraphStore } from "src/lib/svelte-utils/graphlib-store/graphlib-store";
import { get } from "svelte/store";
import {
  graph,
  selectedNodeIds,
  type PixiEdge,
  type PixiNode,
} from "../stores";
import { copyToClipboard } from "./copy_hovered_id";

function createEdotorUrl(graphText: string): string {
  // Base URL for edotor.net
  const baseUrl = "https://edotor.net/?engine=dot#";

  // Encode the graph text to make it URL-safe
  const encodedGraph = encodeURIComponent(graphText);

  // Combine base URL with encoded graph
  return baseUrl + encodedGraph;
}

async function shortenUrl(longUrl: string): Promise<string> {
  try {
    const response = await fetch(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const shortUrl = await response.text();
    return shortUrl;
  } catch (error) {
    console.error("Error shortening URL:", error);
    throw error;
  }
}

// O(Edges in graph)
function findEdgesInSubset(
  graph: GraphStore<PixiNode, PixiEdge>,
  subset: string[]
): PixiEdge[] {
  const edgesInSubset: PixiEdge[] = [];

  Object.values(get(graph.edges)).forEach((edge) => {
    if (subset.includes(edge.srcId) && subset.includes(edge.destId)) {
      edgesInSubset.push(edge);
    }
  });

  return edgesInSubset;
}

export const copySelectionToDot = async () => {
  const subgraph = new Graph({ directed: true });

  const nodeIds = get(selectedNodeIds);

  nodeIds.forEach((id) => {
    const node = get(graph.nodes)[id];
    const attrs = deepUnwrap(node.attr);
    subgraph.setNode(node.id, {
      ...attrs,
      // Set label separately so it looks nice on edotor
      label: get(node.attr.text),
    });
  });

  const edges = findEdgesInSubset(graph, nodeIds);
  edges.forEach((edge) => {
    subgraph.setEdge(edge.srcId, edge.destId, edge.id);
  });

  const graphText = dot.write(subgraph);

  const url = await shortenUrl(createEdotorUrl(graphText));

  copyToClipboard(url, "Graph copied to clipboard");
};
