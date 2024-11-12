import { get, type Writable } from "svelte/store";

export type PositionStore = Writable<{ x: number; y: number }>;

export type DragHelper = ReturnType<typeof dragHelpers>;

export const dragHelpers = (
  item: PositionStore,
  mouse: PositionStore,
  scale: number
) => {
  // Use to calculate position of item relative to mouse
  let diffX: number | undefined = undefined;
  let diffY: number | undefined = undefined;

  const update = () => {
    if (diffX == undefined || diffY == undefined) {
      throw new Error("drag update called before startDrag");
    }

    const mpos = get(mouse);

    item.set({
      x: (mpos.x + diffX) / scale,
      y: (mpos.y + diffY) / scale,
    });
  };

  const start = () => {
    const ipos = get(item);
    const mpos = get(mouse);

    diffX = ipos.x * scale - mpos.x;
    diffY = ipos.y * scale - mpos.y;
  };

  const end = () => {
    diffX = undefined;
    diffY = undefined;
  };

  return {
    update,
    start,
    end,
  };
};
