import { describe, expect, it, vi } from "vitest";
import { writableGraph } from "./writable-graph";

describe("writableGraph", () => {
  it("should add and remove nodes", () => {
    const graphStore = writableGraph();

    graphStore.setNode("A").update();
    expect(graphStore.get().nodeCount()).toBe(1);

    graphStore.removeNode("A").update();
    expect(graphStore.get().nodeCount()).toBe(0);

    graphStore.setNodes(["B", "C"]).update();
    expect(graphStore.get().nodeCount()).toBe(2);
  });

  it("should add and remove edges - monograph", () => {
    const graphStore = writableGraph();

    graphStore.setNode("A").setNode("B").setEdge("A", "B", "e-id").update();

    expect(graphStore.get().edgeCount()).toBe(1);

    graphStore.removeEdge("A", "B", "e-id").update();
    expect(graphStore.get().edgeCount()).toBe(0);

    graphStore
      .setNode("C")
      .setEdges([
        { src: "A", target: "C" },
        { src: "B", target: "C" },
      ])
      .update();
    expect(graphStore.get().edgeCount()).toBe(2);
  });

  it("should update the store when graph changes", async () => {
    const graphStore = writableGraph();

    const spy = vi.fn();

    graphStore.subscribe(spy);
    spy.mockClear(); // subscribe calls the function initially

    graphStore.setNode("A");
    expect(spy).not.toHaveBeenCalled();
    graphStore.setNode("B").update();

    expect(spy).toHaveBeenCalled();
  });
});
