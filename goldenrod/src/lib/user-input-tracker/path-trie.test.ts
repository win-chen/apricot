import { describe, expect, it } from "vitest";
import { deletePathFromSearchTree, writePathTrie } from "./path-trie";
import { Graph } from "@dagrejs/graphlib";

const expectEqualGraphs = (graph: Graph, expectedGraph: Graph) => {
  expect(graph.nodes().sort()).toEqual(expectedGraph.nodes().sort());
  expect(graph.edgeCount()).toEqual(expectedGraph.edgeCount());
  graph.edges().forEach((edge) => {
    expect(expectedGraph.hasEdge(edge)).toBeTruthy();
  });
};

describe("path trie - writes", () => {
  it("writes paths to graph", () => {
    const graph = new Graph({ directed: true });
    let leaves = writePathTrie(graph, [["E", "A"], "C"], "R");

    const expectedGraph = new Graph({ directed: true });

    expectedGraph.setNode("R/E");
    expectedGraph.setEdge("R", "R/E");
    expectedGraph.setNode("R/A");
    expectedGraph.setEdge("R", "R/A");

    expectedGraph.setNode("R/E/A");
    expectedGraph.setEdge("R/E", "R/E/A");
    expectedGraph.setNode("R/A/E");
    expectedGraph.setEdge("R/A", "R/A/E");

    expectedGraph.setNode("R/E/A/C");
    expectedGraph.setEdge("R/E/A", "R/E/A/C");
    expectedGraph.setNode("R/A/E/C");
    expectedGraph.setEdge("R/A/E", "R/A/E/C");

    expectEqualGraphs(graph, expectedGraph);
    expect(leaves.sort()).toEqual(["R/A/E/C", "R/E/A/C"]);

    leaves = writePathTrie(graph, ["C", ["B", "H"], "D"], "R");

    expectedGraph.setNode("R/C");
    expectedGraph.setEdge("R", "R/C");

    expectedGraph.setNode("R/C/B");
    expectedGraph.setEdge("R/C", "R/C/B");
    expectedGraph.setNode("R/C/H");
    expectedGraph.setEdge("R/C", "R/C/H");

    expectedGraph.setNode("R/C/B/H");
    expectedGraph.setEdge("R/C/B", "R/C/B/H");
    expectedGraph.setNode("R/C/H/B");
    expectedGraph.setEdge("R/C/H", "R/C/H/B");

    expectedGraph.setNode("R/C/B/H/D");
    expectedGraph.setEdge("R/C/B/H", "R/C/B/H/D");
    expectedGraph.setNode("R/C/H/B/D");
    expectedGraph.setEdge("R/C/H/B", "R/C/H/B/D");

    expectEqualGraphs(graph, expectedGraph);
    expect(leaves.sort()).toEqual(["R/C/B/H/D", "R/C/H/B/D"]);
  });

  it("writes without root", () => {
    const graph = new Graph({ directed: true });
    writePathTrie(graph, [["E", "A"], "C"]);

    const expectedGraph = new Graph({ directed: true });
    expectedGraph.setNode("_/E");
    expectedGraph.setEdge("_", "_/E");
    expectedGraph.setNode("_/A");
    expectedGraph.setEdge("_", "_/A");

    expectedGraph.setNode("_/E/A");
    expectedGraph.setEdge("_/E", "_/E/A");
    expectedGraph.setNode("_/A/E");
    expectedGraph.setEdge("_/A", "_/A/E");

    expectedGraph.setNode("_/E/A/C");
    expectedGraph.setEdge("_/E/A", "_/E/A/C");
    expectedGraph.setNode("_/A/E/C");
    expectedGraph.setEdge("_/A/E", "_/A/E/C");

    expectEqualGraphs(graph, expectedGraph);
  });
});

describe("path trie - deletes", () => {
  it("delete paths", () => {
    const graph = new Graph({ directed: true });
    writePathTrie(graph, [["E", "A"], "C"]);

    deletePathFromSearchTree(graph, "_/E/A/C");

    const expected = new Graph({ directed: true });
    expected.setNode("_/A");
    expected.setEdge("_", "_/A");

    expected.setNode("_/A/E");
    expected.setEdge("_/A", "_/A/E");

    expected.setNode("_/A/E/C");
    expected.setEdge("_/A/E", "_/A/E/C");

    expectEqualGraphs(graph, expected);
  });

  it("does not delete subpaths used in other paths", () => {
    const graph = new Graph({ directed: true });
    writePathTrie(graph, ["C", "B", "H"]);
    writePathTrie(graph, ["C", "A"]);

    deletePathFromSearchTree(graph, "_/C/B/H");

    const expected = new Graph({ directed: true });
    expected.setNode("_/C");
    expected.setEdge("_", "_/C");

    expected.setNode("_/C/A");
    expected.setEdge("_/C", "_/C/A");

    expectEqualGraphs(graph, expected);
  });

  it("does not delete paths with non-path node predecessors", () => {
    const graph = new Graph({ directed: true });
    writePathTrie(graph, ["C", "B", "H"]);
    graph.setNode("dummy");
    graph.setEdge("dummy", "_/C/B");

    deletePathFromSearchTree(graph, "_/C/B/H");

    const expected = new Graph({ directed: true });

    expected.setNode("_/C");
    expected.setEdge("_", "_/C");

    expected.setNode("_/C/B");
    expected.setEdge("_/C", "_/C/B");

    expected.setNode("dummy");
    expected.setEdge("dummy", "_/C/B");

    expectEqualGraphs(graph, expected);
  });
});
