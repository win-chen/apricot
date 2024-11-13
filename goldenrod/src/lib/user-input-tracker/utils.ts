import { get, type Writable } from "svelte/store";
import { specialCharNames, type SpecialCharKey } from "./types";

/**
 * Generates all possible permutations of an array.
 * @param arr - The input array of elements of type T
 * @returns An array containing all possible permutations of the input array
 */
export function getAllPermutations<T>(arr: T[]): T[][] {
  // Base case: if array has only one element, return it wrapped in an array
  if (arr.length <= 1) return [arr];

  const result: T[][] = [];

  // Take each element as first element and get permutations of the rest
  for (let i = 0; i < arr.length; i++) {
    // Get current element
    const current = arr[i];

    // Get array without current element
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];

    // Get permutations of remaining elements
    const remainingPerms = getAllPermutations(remaining);

    // Add current element to beginning of each permutation
    for (const perm of remainingPerms) {
      result.push([current, ...perm]);
    }
  }

  return result;
}

const _isStore = (value: any) => {
  const isStore =
    typeof value === "object" &&
    value !== null &&
    "set" in value &&
    typeof value.set === "function" &&
    "subscribe" in value &&
    typeof value.subscribe === "function" &&
    "update" in value &&
    typeof value.update === "function";
  return isStore;
};

export function isBooleanWritable(value: any): value is Writable<boolean> {
  if (!_isStore(value)) {
    return false;
  }

  const containsBoolean = typeof get(value) === "boolean";

  return containsBoolean;
}

function _getUnshiftedKey(key: string) {
  return shiftedToUnshiftedKey.get(key) || key.toUpperCase();
}

export function getNormalizedKey(key: string) {
  const normKey = _getUnshiftedKey(key);
  return specialCharNames[normKey as SpecialCharKey] || normKey;
}

/**
 * Get unshifted key from shifted.
 * For character keys use toUpperCase()
 * */
const shiftedToUnshiftedKey = new Map([
  ["~", "`"],
  ["!", "1"],
  ["@", "2"],
  ["#", "3"],
  ["$", "4"],
  ["%", "5"],
  ["^", "6"],
  ["&", "7"],
  ["*", "8"],
  ["(", "9"],
  [")", "0"],
  ["_", "-"],
  ["^", "6"],
  ["+", "="],
  ["{", "["],
  ["}", "]"],
  ["|", "\\"],
  [":", ";"],
  ['"', "'"],
  ["<", ","],
  [">", "."],
  ["?", "/"],
]);
