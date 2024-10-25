import { describe, test, expect } from "vitest";
import { deepWritable } from "./deep-writable";
import { get } from "svelte/store";

describe("deepWritable", () => {    
  test("creates writables", () => {
    const input = {
        text: "hello",
        number: 123,
        bool: true,
        arr: [1, 2, 3]
    };
    
    const result = deepWritable(input);

    result.text.set("bye");
    result.number.set(234);
    result.bool.set(false);
    result.arr.set([2, 3, 4]);

    expect(get(result.text)).toBe("bye");
    expect(get(result.number)).toBe(234);
    expect(get(result.bool)).toBe(false);
    expect(get(result.arr)).toEqual([2, 3, 4]);    
  });

  test("creates nested writables", () => {
    const input = {
        person: {
            name: "Lily",
            age: 33
        }
    };

    const result = deepWritable(input);

    result.person.name.set("Thea");
    result.person.age.set(44);

    expect(get(result.person.name)).toBe("Thea");
    expect(get(result.person.age)).toBe(44);
  });

});
