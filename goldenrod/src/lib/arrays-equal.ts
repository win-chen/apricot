export function arraysEqual(arr1: any[], arr2: any[]) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((element, index) => element === arr2[index]);
}
  