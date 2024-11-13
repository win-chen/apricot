import { get } from "svelte/store";
import { renderFrame } from "../state";

type ZoomFn = (scale: number, zoomFactor: number) => number;

const _zoomOut: ZoomFn = (scale: number, zoomFactor: number) => {
  return scale * (1 / zoomFactor);
};

const _zoomIn: ZoomFn = (scale: number, zoomFactor: number) => {
  return scale * zoomFactor;
};

renderFrame;

export const zoomFunctions = (zoomFn: ZoomFn) => {
  let timeout: NodeJS.Timeout | undefined = undefined;
  let zoomFactor = 1.05; // Base zoom factor
  let zoomDecay = 0.001; // How quickly the zoom factor increases
  const interval = 30;

  const start = () => {
    timeout = setInterval(() => {
      let scale = get(renderFrame.scale);
      scale = zoomFn(scale, zoomFactor);
      zoomFactor += zoomDecay; // Increase the zoom factor over time
      renderFrame.scale.set(scale);
    }, interval);
  };

  const stop = () => {
    clearInterval(timeout);
    zoomFactor = 1.05;
    zoomDecay = 0.001;
  };

  return {
    start,
    stop,
  };
};

export const zoomIn = zoomFunctions(_zoomIn);
export const zoomOut = zoomFunctions(_zoomOut);
