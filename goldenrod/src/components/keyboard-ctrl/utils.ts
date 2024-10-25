export function getUnshiftedKey(key: string) {
    return shiftedToUnshiftedKey.get(key) || key.toLowerCase();
}

/** 
 * Get unshifted key from shifted.
 * For character keys use toLowerCase()
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
    ["\"", "'"],
    ["<", ","],
    [">", "."],
    ["?", "\/"],
])
