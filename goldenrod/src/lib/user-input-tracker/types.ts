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
export type Key = (typeof keys)[number] | SpecialCharName;

export type UserInput = Key | Gesture;

export const specialCharNames = {
  "`": "BACK_TIC",
  "-": "HYPHEN",
  "=": "EQUALS",
  "[": "OPEN_BRACKET",
  "]": "CLOSED_BRACKET",
  "\\": "BACK_SLASH",
  ";": "SEMICOLON",
  "'": "SINGLE_QUOTE",
  ",": "COMMA",
  ".": "PERIOD",
  "/": "FORWARD_SLASH",
} as const;

export type SpecialCharKey = keyof typeof specialCharNames;
export type SpecialCharName = (typeof specialCharNames)[SpecialCharKey];
