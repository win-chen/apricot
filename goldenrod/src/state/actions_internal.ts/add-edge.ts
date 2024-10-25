import { createEdge } from "src/graphql/requests";
import { optimisticAddEdge } from "./optimistic";
import { get, type Writable } from "svelte/store";

export const createAddEdgeInstance = (
  hoveredNodeId: Writable<string | undefined>,
  edgeSrc: Writable<string | undefined>,
  edgeDest: Writable<string | undefined>
) => {
  const reset = () => {
    edgeSrc.set(undefined);
    edgeDest.set(undefined);
  } 

  const selectSrc = () => {
    edgeSrc.set(get(hoveredNodeId));
  };

  const selectDest = () => {
    edgeDest.set(get(hoveredNodeId));
    const src = get(edgeSrc);
    const dest = get(edgeDest);

    if (!(src && dest)) {
      return;
    }
    
    optimisticAddEdge(src, dest);
    createEdge(src, dest);
    reset();
  }
  
  return {
    selectSrc,
    selectDest,
    reset,
  };
};
