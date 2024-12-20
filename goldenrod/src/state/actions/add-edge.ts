import { createEdge } from "src/graphql/requests";
import { get } from "svelte/store";
import { optimisticAddEdge } from "../lib/optimistic";
import { proposedEdgeSrc } from "../stores/add-edge";
import { hoveredNodeId } from "../stores/ui";

const setSrc = () => {
  proposedEdgeSrc.set(get(hoveredNodeId));
};

const clear = () => {
  proposedEdgeSrc.set(undefined);
};
const submit = () => {
  const src = get(proposedEdgeSrc);
  const dest = get(hoveredNodeId);

  if (!(src && dest)) {
    return;
  }

  if (src === dest) {
    return;
  }

  optimisticAddEdge(src, dest);
  createEdge(src, dest);
  clear();
};

export const addEdge = {
  setSrc,
  clear,
  submit,
};
