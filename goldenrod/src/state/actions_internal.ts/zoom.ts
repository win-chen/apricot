import { type Container } from "pixi.js";

type ZoomFn = (scale: number, zoomFactor: number) => number;

export const zoomOut: ZoomFn = (scale: number, zoomFactor: number) => {
  return scale * (1 / zoomFactor);
}

export const zoomIn: ZoomFn = (scale: number, zoomFactor: number) => {
  return scale * zoomFactor;
}

export const zoomFunctions = (container: Container, zoomFn: ZoomFn) => {
  let timeout: NodeJS.Timeout|undefined = undefined;
  let scale = 1;
  let zoomFactor = 1.01; // Base zoom factor
  let zoomDecay = 0.001; // How quickly the zoom factor increases
  const interval = 30;

  const start = () => {
    timeout = setInterval(() => {
      scale = container.scale.x;
      scale = zoomFn(scale, zoomFactor);
      zoomFactor += zoomDecay; // Increase the zoom factor over time
      container.scale.set(scale);
      container.emit("custom-scale", scale);
    }, interval);
  }
  
  const stop = () => {
    clearInterval(timeout);
    zoomFactor = 1.01;
    zoomDecay = 0.001; 
  }

  return {
    start,
    stop
  }
}