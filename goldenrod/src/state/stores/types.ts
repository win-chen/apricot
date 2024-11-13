import type { Node } from "src/gql/graphql";
import type { DeepWritable } from "src/lib/svelte-utils/deep-writable";
import type { Readable, Writable } from "svelte/store";
import type { DerivedNodeData } from "./nodes";

export type RelativePositon = { x: number; y: number };

type Position = { top: number; left: number }; // TODO: Make edge store values (PixiEdge) not writable
// TODO: Make color writable

export enum EdgeLabel {
  CONTAINS = "CONTAINS",
  LINKED = "LINKED",
}

export interface PixiEdge {
  readonly id: string; // src+dest, this will break with multiple edge. replace with some other id solution
  readonly label: EdgeLabel; // Contains
  srcId: string;
  destId: string;
  src: Readable<Position>;
  dest: Readable<Position>;
  color: string;
  // Float 0 to 1. Opacity 0 is not rendered
  opacity: Writable<number>;
}

// TODO: rewrite so that attrs is flat onto PixiNode
export interface PixiNode {
  readonly id: string;
  attr: Attrs;
  derived: DerivedNodeData;
  ui: UI;
}

// Persisted attributes
export interface Attrs extends DeepWritable<Omit<Node, "id">> {
  id: string;
}

// Non persisted attributes
export interface UI {
  // Unscaled dimensions of its component, written to by render component
  dimensions: Writable<{ width: number; height: number }>;
  // written to by store
  position: Writable<{ top: number; left: number }>;
  // Float 0 to 1. Opacity 0 is not rendered
  opacity: Writable<number>;
  inFrame: Writable<boolean>;
  shouldRender: Writable<boolean>;
  color: Writable<string | null>;
}
