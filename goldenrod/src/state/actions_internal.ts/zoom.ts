import { type Container } from "pixi.js";
import { writable } from "svelte/store";

type ZoomFn = (scale: number, zoomFactor: number) => number;

export const zoomOut: ZoomFn = (scale: number, zoomFactor: number) => {
  return scale * (1 / zoomFactor);
};

export const zoomIn: ZoomFn = (scale: number, zoomFactor: number) => {
  return scale * zoomFactor;
};

export const zoomFunctions = (container: Container, zoomFn: ZoomFn) => {
  let timeout: NodeJS.Timeout | undefined = undefined;
  let zoomFactor = 1.01; // Base zoom factor
  let zoomDecay = 0.001; // How quickly the zoom factor increases
  const interval = 30;

  const start = () => {
    timeout = setInterval(() => {
      let scale = container.scale.x;
      scale = zoomFn(scale, zoomFactor);
      zoomFactor += zoomDecay; // Increase the zoom factor over time
      container.scale.set(scale);
      container.emit("custom-scale", scale);
    }, interval);
  };

  const stop = () => {
    clearInterval(timeout);
    zoomFactor = 1.01;
    zoomDecay = 0.001;
  };

  return {
    start,
    stop,
  };
};

const _zoomOut: ZoomFn = (scale: number, zoomFactor: number) => {
  return scale * (1 / zoomFactor);
};

const _zoomIn: ZoomFn = (scale: number, zoomFactor: number) => {
  return scale * zoomFactor;
};

enum ZoomStatus {
  UNINITIALIZED,
  IDLE,
  ZOOMING,
}

interface ZoomState {
  timeout?: NodeJS.Timeout;
  zoomFactor: number;
  zoomDecay: number;
  container: Container;
  status: ZoomStatus.IDLE | ZoomStatus.ZOOMING;
}

const zoomStore = writable<ZoomState | { status: ZoomStatus.UNINITIALIZED }>({
  status: ZoomStatus.UNINITIALIZED,
});

const ZOOM_INTERVAL = 30;

export const zoomFunctions2 = (container: Container, zoomFn: ZoomFn) => {
  let timeout: NodeJS.Timeout | undefined = undefined;
  let zoomFactor = 1.01; // Base zoom factor
  let zoomDecay = 0.001; // How quickly the zoom factor increases
  const interval = 30;

  const start = () => {
    timeout = setInterval(() => {
      let scale = container.scale.x;
      scale = zoomFn(scale, zoomFactor);
      zoomFactor += zoomDecay; // Increase the zoom factor over time
      container.scale.set(scale);
      container.emit("custom-scale", scale);
    }, interval);
  };

  const stop = () => {
    clearInterval(timeout);
    zoomFactor = 1.01;
    zoomDecay = 0.001;
  };

  return {
    start,
    stop,
  };
};
