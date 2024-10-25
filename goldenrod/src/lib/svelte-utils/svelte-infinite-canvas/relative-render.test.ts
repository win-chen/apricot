import { describe, it, expect } from "vitest";
import { RelativeRenderFrame } from "./relative-render";
import { get } from "svelte/store";

describe("coordinate calculator", () => {
  it("coordToFramePosition - basic", () => { 
    const calc = new RelativeRenderFrame({
      origin: {
        top: 0,
        left: 0
      },
      scale: 1
    });
    
    const result = calc.coordToFramePosition({x: 10, y: 20});
    expect(result).toEqual({top: 20, left: 10});
  });

  it("coordToFramePosition - scaled and translated", () => { 
    const calc = new RelativeRenderFrame({
      origin: {
        top: -10,
        left: -10
      },
      scale: 0.5
    });
    
    const result = calc.coordToFramePosition({x: 10, y: 20});
    expect(result).toEqual({top: 5, left: 0});
  });
  
  it("positionToCoord - basic", () => { 
    const calc = new RelativeRenderFrame({
      origin: {
        top: 0,
        left: 0
      },
      scale: 1
    });
    
    const result = calc.framePositionToCoord({top: 10, left: 20});
    expect(result).toEqual({x: 20, y: 10});
  });

  it("positionToCoord - scaled and translated", () => { 
    const calc = new RelativeRenderFrame({
      origin: {
        top: -10,
        left: -10
      },
      scale: 0.5
    });
    
    const result = calc.framePositionToCoord({top: 10, left: 20});
    expect(result).toEqual({ x: 50, y: 30 });
  });

  it("shouldRender", () => {
    const calc = new RelativeRenderFrame({
      dimensions: { width: 100, height: 100 },
      origin: { top: 0, left: 0 },
      scale: 1,
      buffer: 0,
    });

    // Inside render rect
    const rect = { x: 10, y: 10, width: 20, height: 20 };
    expect(calc.shouldRender(rect)).toBe(true);

    // Partial overlap
    const overlapRect = { x: -10, y: -10, width: 20, height: 20 };
    expect(calc.shouldRender(overlapRect)).toBe(true);

    // Complete overlap
    const completeOverlapRect = { x: -10, y: -10, width: 1000, height: 1000 };
    expect(calc.shouldRender(completeOverlapRect)).toBe(true);
    
    
    // Outside render rect
    const outsideRect = { x: 150, y: 150, width: 20, height: 20 };
    expect(calc.shouldRender(outsideRect)).toBe(false);
  });

  it("resize", () => {
    const calc = new RelativeRenderFrame({
      dimensions: { width: 10, height: 10 },
      origin: { top: 0, left: 0 },
      scale: 1,
      buffer: 0
    });

    const rect = { x: 15, y: 15, width: 20, height: 20 };
    expect(calc.shouldRender(rect)).toBe(false);
    
    calc.dimensions.set({ width: 16, height: 16 });

    expect(calc.shouldRender(rect)).toBe(true);
  });

  it("rescale", () => {
    const calc = new RelativeRenderFrame({
      scale: 1
    });

    calc.scale.set(2);

    expect(calc.coordToFramePosition({x: 5, y: 10}))
      .toEqual({top: 20, left: 10});

    expect(get(calc.scale)).toBe(2);
  });

  it("pans", () => {
    const calc = new RelativeRenderFrame({
      origin: { top: 0, left: 0 }
    });

    calc.originPoint.set({ top: 50, left: 50 });

    expect(calc.coordToFramePosition({x: 5, y: 10}))
      .toEqual({top: 60, left: 55});
  });
});