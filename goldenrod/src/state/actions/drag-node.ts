import { dragHelpers, type DragHelper } from "src/lib/svelte-utils/drag-helper";
import { get, writable } from "svelte/store";
import { renderFrame } from "../state";
import { hoveredNodeId, listener, pointerPos } from "../state/ui";
import { getNodeWritableXY } from "../utils";

interface DragInstance {
  draggingId: string;
  methods: DragHelper;
}

let dragInstance: DragInstance | null = null;

// An adapter function between the PixiNode x,y and draghelper x,y
const _subscribeNodePosition = (id: string) => {
  const { x, y } = getNodeWritableXY(id);

  const nodePosition = writable({
    x: get(x),
    y: get(y),
  });

  nodePosition.subscribe((val) => {
    x.set(val.x);
    y.set(val.y);
  });
  return nodePosition;
};

const _initDrag = () => {
  const id = get(hoveredNodeId)!;
  const nodePosition = _subscribeNodePosition(id);

  dragInstance = {
    draggingId: id,
    methods: dragHelpers(nodePosition, pointerPos, get(renderFrame.scale)),
  };
};

const start = () => {
  _initDrag();
  get(listener)?.addEventListener(
    "globalpointermove",
    dragInstance?.methods.update as EventListenerOrEventListenerObject
  );
  dragInstance?.methods.start();
};

const finish = () => {
  if (!dragInstance) {
    return;
  }
  get(listener)?.removeEventListener(
    "globalpointermove",
    dragInstance?.methods.update as EventListenerOrEventListenerObject
  );

  const draggedId = dragInstance?.draggingId;
  dragInstance?.methods.end();
  dragInstance = null;
  return draggedId!;
};

export const dragNode = {
  start,
  finish,
};
