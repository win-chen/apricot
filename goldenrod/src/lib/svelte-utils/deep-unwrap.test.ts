import { writable } from "svelte/store";
import { describe, expect, it, test } from "vitest";
import { deepUnwrap } from "./deep-unwrap";

describe('unwrap', () => {
  it('unwraps readables and writables', () => {
    const testObj = {
      str: writable("hello"),
      number: writable(123),
      obj: writable({ a: "world "})
    };

    const result = deepUnwrap(testObj);

    expect(result.str).toBe("hello");
    expect(result.number).toBe(123);
    expect(result.obj).toEqual({ a: "world "});
  });

  it('unwraps arrays', () => {
    const testObj = {
      str: writable("hello"),
      number: writable(123),
      obj: writable({ a: "world "})
    };

    const result = deepUnwrap([testObj])[0];

    expect(result.str).toBe("hello");
    expect(result.number).toBe(123);
    expect(result.obj).toEqual({ a: "world "});
  });

  it('unwraps deeply', () => {
    const testObj = {
      deep: writable({
        str: writable("hello"),
        number: writable(123),
        arr: [writable({ a: "world "}), writable({ b: "hello "})],
      })
    };

    const result = deepUnwrap(testObj);

    expect(result.deep.str).toBe("hello");
    expect(result.deep.number).toBe(123);
    expect(result.deep.arr[0]).toEqual({ a: "world "});
    expect(result.deep.arr[1]).toEqual({ b: "hello "});
  });
});