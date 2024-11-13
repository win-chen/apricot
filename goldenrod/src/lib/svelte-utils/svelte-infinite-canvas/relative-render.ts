import { EventEmitter } from "pixi.js";
import {
  derived,
  get,
  writable,
  type Readable,
  type Writable,
} from "svelte/store";

/**
 * Summary:
 * Coords ([x, y]) are relative to Origin
 * Positions ([top, left]) are relative to Frame/Window
 * Coords follow the same quandrant arithmetic as Positions
 * That is, positive x,y values are bottom right quadrant
 * and negative x,y values are top left quadrant
 */
interface Position {
  left: number;
  top: number;
}

// Position relative to Origin
interface Coord {
  x: number;
  y: number;
}

interface TwoDims {
  width: number;
  height: number;
}

interface CoordRect extends Coord, TwoDims {}

// Use for calculations
interface PositionRect extends Position {
  bot: number;
  right: number;
}

/**
 * Holds the state of the render frame to use to calculate
 * Implicitly updates position for each item in the canvas
 */
export class RelativeRenderFrame extends EventEmitter {
  // Number of pixels out of view to also render
  private buffer: number;
  // Bounding rect of the render frame including the buffer
  private renderRect: Readable<PositionRect>;

  // Dimensions of the render frame
  public dimensions: Writable<TwoDims>;
  // Scale of the render frame
  public scale: Writable<number>;
  // Position of origin in relation to frame's top, left
  public originPoint: Writable<Position>;

  constructor(opts?: {
    dimensions?: TwoDims;
    origin?: Position;
    scale?: number;
    buffer?: number;
  }) {
    super();

    const {
      dimensions = { width: 0, height: 0 },
      origin = { top: 0, left: 0 },
      scale = 1,
      buffer = 50,
    } = opts || {};

    this.scale = writable(scale);
    this.dimensions = writable(dimensions);
    this.buffer = buffer;

    this.renderRect = derived(this.dimensions, (dims) => ({
      top: -this.buffer,
      left: -this.buffer,
      bot: dims.height + this.buffer,
      right: dims.width + this.buffer,
    }));

    this.originPoint = writable(origin);

    // TODO: Refactore out events. We can just make derived stores
    this.originPoint.subscribe(() => this.emit("frame-change"));
    this.dimensions.subscribe(() => this.emit("frame-change"));
    this.scale.subscribe(() => this.emit("frame-change"));
  }

  public shouldRender(rect: CoordRect): boolean {
    const { x, y, width, height } = rect;
    const posTopLeft = this.coordToFramePosition({ x, y });
    const posBottomRight = this.coordToFramePosition({
      // TODO: This is actually inaccurate since nodes are currently circles
      // They are anchored in the middle
      x: x + width,
      y: y + height,
    });

    return this.isInFrame(posTopLeft, posBottomRight);
  }

  /**
   *
   * @param pos1 one of two points defining a rectangle
   * @param pos2 one of two points defining a rectangle
   * @returns
   */
  private static getCorners(pos1: Position, pos2: Position): PositionRect {
    return {
      top: Math.min(pos1.top, pos2.top),
      left: Math.min(pos1.left, pos2.left),
      bot: Math.max(pos1.top, pos2.top),
      right: Math.max(pos1.left, pos2.left),
    };
  }

  /**
   *
   * @param pos1 one of two points defining a rectangle
   * @param pos2 one of two points defining a rectangle
   * @returns Whether any part of the rectangle is in frame
   */
  public isInFrame(pos1: Position, pos2: Position): boolean {
    const pos = RelativeRenderFrame.getCorners(pos1, pos2);

    const { top, left, bot, right } = get(this.renderRect);

    const render = !(
      pos.bot < top ||
      pos.top > bot ||
      pos.right < left ||
      pos.left > right
    );

    return render;
  }

  // Returns position relative to container given a coordinate relative to origin
  // Use when drawing item
  public coordToContainerPosition(coord: Coord) {
    const { top, left } = get(this.originPoint);
    return {
      top: coord.y + top,
      left: coord.x + left,
    };
  }

  // Use to check where item is actually drawn
  public coordToFramePosition(coord: Coord) {
    const pos = this.coordToContainerPosition(coord);
    return {
      top: pos.top * get(this.scale),
      left: pos.left * get(this.scale),
    };
  }

  // Returns coordinate relative to origin given position relative to frame
  // Use to translate mouse positions to x, y
  public framePositionToCoord(pos: Position) {
    const { top, left } = get(this.originPoint);
    return {
      x: pos.left / get(this.scale) - left,
      y: pos.top / get(this.scale) - top,
    };
  }

  // Convenience function used for deriving state whenever the frame is changed
  public getStores() {
    return [this.originPoint, this.scale, this.dimensions];
  }
}
