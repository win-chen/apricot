import type { Writable } from "svelte/store";

export interface DurationConfig {
  onEnter: Function;
  interval?: [Function, number]; // Convenience function?
  onLeave: Function;
}

type StringKeys<T> =
  | (keyof T & string)
  | (keyof T & string extends string ? `not:${keyof T & string}` : never);

/**
 * T represents customInput object
 */

export type AvailableInputs<T extends Record<string, any>> =
  | UserInput
  | StringKeys<T>;

/**
 * T represents customInput object
 */
export interface Config<T extends Record<string, any>> {
  input: (AvailableInputs<T> | AvailableInputs<T>[])[];
  onEnter?: Function;
  onLeave?: Function;
  forDuration?: DurationConfig;
  store: Writable<boolean>;
}

export type ConfigList<T extends Record<string, any> = {}> = Record<
  string,
  Config<T>
>;
export const gestures = ["CLICK"] as const;
export type Gesture = (typeof gestures)[number];

export const keys = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "BACKSPACE",
] as const;
export type Key = (typeof keys)[number];

export type UserInput = Key | Gesture;
