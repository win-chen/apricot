// TODO

import { get } from "svelte/store";
import { describe, expect, it } from "vitest";
import { clusterer as makeClusterer } from "./clusterer";

describe("clusterer", () => {
  it("adds nodes to be clustered", () => {
    const clusterer = makeClusterer();

    expect(get(clusterer.currentLevelIds)).toEqual(new Set());

    clusterer.addNodes(["a", "b"]);

    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["a", "b"]));
  });

  it("inserts a cluster", () => {
    const clusterer = makeClusterer();

    clusterer.addNodes(["a", "b"]);

    clusterer.insertCluster("group", ["a", "b"]);

    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["group"]));

    clusterer.levelDown();
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["a", "b"]));
  });

  it("inserts a level if clustering all nodes on a level", () => {
    const clusterer = makeClusterer();

    clusterer.addNodes(["a", "b", "c"]);

    clusterer.insertCluster("ab", ["a", "b"]);
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["ab", "c"]));

    clusterer.insertCluster("z", ["ab", "c"]);
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["z"]));

    clusterer.levelDown();
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["ab", "c"]));

    clusterer.levelDown();
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["a", "b", "c"]));
  });

  it("inserts clusters in between two levels", () => {
    const clusterer = makeClusterer();

    clusterer.addNodes(["a", "b", "c"]);
    clusterer.insertCluster("z", ["a", "b", "c"]);

    clusterer.levelDown();
    clusterer.insertCluster("ab", ["a", "b"]);
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["ab", "c"]));

    clusterer.levelUp();
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["z"]));

    clusterer.levelDown();
    clusterer.levelDown();
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["a", "b", "c"]));
  });

  it("does not insert a level if clustering unclustered nodes", () => {
    const clusterer = makeClusterer();

    clusterer.addNodes(["a", "b", "c"]);
    clusterer.insertCluster("ab", ["a", "b"]);
    clusterer.insertCluster("x", ["c"]);

    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["ab", "x"]));
    clusterer.levelDown();
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["a", "b", "c"]));
  });

  it("adds nodes to lowest level", () => {
    const clusterer = makeClusterer();

    clusterer.addNodes(["a", "b", "c"]);
    clusterer.insertCluster("ab", ["a", "b"]);
    clusterer.insertCluster("z", ["ab", "c"]);
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["z"]));

    clusterer.addNodes(["x", "y"]);
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["x", "y", "z"]));

    clusterer.levelDown();
    expect(get(clusterer.currentLevelIds)).toEqual(
      new Set(["x", "y", "ab", "c"])
    );

    clusterer.levelDown();
    expect(get(clusterer.currentLevelIds)).toEqual(
      new Set(["x", "y", "a", "b", "c"])
    );
  });

  it("throws an error when trying to cluster something not currently in view", () => {
    const clusterer = makeClusterer();

    clusterer.addNodes(["a", "b", "c"]);
    clusterer.insertCluster("ab", ["a", "b"]);

    expect(() => {
      clusterer.insertCluster("x", ["a"]);
    }).toThrowError();
  });

  it("removes clusters", () => {
    const clusterer = makeClusterer();

    clusterer.addNodes(["a", "b", "c"]);
    clusterer.insertCluster("ab", ["a", "b"]);
    clusterer.insertCluster("z", ["ab", "c"]);

    clusterer.removeCluster("z");
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["ab", "c"]));

    clusterer.levelDown();
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["a", "b", "c"]));
  });

  it("removes clusters in between levels", () => {
    const clusterer = makeClusterer();

    clusterer.addNodes(["a", "b", "c"]);
    clusterer.insertCluster("ab", ["a", "b"]);
    clusterer.insertCluster("z", ["ab", "c"]);

    clusterer.levelDown();
    clusterer.removeCluster("ab");
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["a", "b", "c"]));

    clusterer.levelDown();
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["a", "b", "c"]));
  });

  it("does not move levels when removing a cluster if more clusters exist at that level", () => {
    const clusterer = makeClusterer();

    clusterer.addNodes(["a", "b", "c"]);
    clusterer.insertCluster("ab", ["a", "b"]);
    clusterer.insertCluster("x", ["c"]);
    clusterer.insertCluster("z", ["ab", "x"]);
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["z"]));

    clusterer.levelDown();
    clusterer.removeCluster("x");
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["ab", "c"]));

    clusterer.levelUp();
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["z"]));

    clusterer.levelDown();
    clusterer.levelDown();
    expect(get(clusterer.currentLevelIds)).toEqual(new Set(["a", "b", "c"]));
  });

  it("throw error when trying to remove a cluster that doesn't exist in the current view", () => {
    const clusterer = makeClusterer();

    clusterer.addNodes(["a", "b", "c"]);
    clusterer.insertCluster("ab", ["a", "b"]);
    clusterer.insertCluster("z", ["ab", "c"]);

    expect(() => {
      clusterer.removeCluster("ab");
    }).toThrowError();
  });
});
