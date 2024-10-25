import { describe, it, expect, beforeEach, vi } from "vitest";
import { createGraph, type GraphStore } from "./graphlib-store";
import { get } from "svelte/store";

describe("createGraph", () => {
  let graph: GraphStore;

  beforeEach(() => {
    graph = createGraph<{ id: string }, { id: string }>();
  });

  describe("setNode", () => {
    it("should add a node to the graph and nodeRecord", () => {
      graph.setNode("1", { id: "1" });

      const spy = vi.fn();

      graph.nodes.subscribe(spy);

      expect(get(graph.nodes)["1"]).toEqual({ id: "1" });
      expect(graph.state.hasNode("1")).toBe(true);
      expect(spy).toHaveBeenCalledWith({ "1": { id: "1" } });
    });
  });

  describe("setEdge", () => {
    it("should add an edge to the graph and edgeRecord", () => {
      graph.setNode("1", { id: "1" });
      graph.setNode("2", { id: "2" });
      graph.setEdge("1", "2", { id: "edge1" });

      expect(get(graph.edges)["edge1"]).toEqual({ id: "edge1" });
      expect(graph.state.hasEdge("1", "2")).toBe(true);
    });
  });

  describe("removeNode", () => {
    it("should remove a node and all connected edges", () => {
      graph.setNode("1", { id: "1" });
      graph.setNode("2", { id: "2" });
      graph.setEdge("1", "2", { id: "edge1" });

      const result = graph.removeNode("1");

      expect(get(graph.nodes)["1"]).toBeUndefined();
      expect(get(graph.edges)["edge1"]).toBeUndefined();
      expect(graph.state.hasNode("1")).toBe(false);
      expect(result.edges).toHaveLength(1); // Should return removed edges
    });
  });

  describe("removeEdge", () => {
    it("should remove an edge from the graph and edgeRecord", () => {
      graph.setNode("1", { id: "1" });
      graph.setNode("2", { id: "2" });
      graph.setEdge("1", "2", { id: "edge1" });

      graph.removeEdge("1", "2", "edge1");

      expect(get(graph.edges)["edge1"]).toBeUndefined();
      expect(graph.state.hasEdge("1", "2")).toBe(false);
    });
  });
});
