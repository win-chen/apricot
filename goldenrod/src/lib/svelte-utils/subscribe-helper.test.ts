import { writable } from "svelte/store";
import { describe, it, expect, vi } from "vitest";
import { subscribeHelper } from "./subscribe-helper";

describe.only("subscribeHelper", () => {
  it("should trigger the add callback when a new key is added", () => {
    const store = writable<Record<string, number>>({});
    
    const onAddCallback = vi.fn();
    subscribeHelper(store)
      .doOnceOnAdd(onAddCallback)
      .subscribe();

    // Set the store with a new key
    store.set({ a: 1 });

    // Expect the add callback to be called with 'a' and 1
    expect(onAddCallback).toHaveBeenCalledWith("a", 1, {});
    expect(onAddCallback).toHaveBeenCalledTimes(1);
  });

  it("should trigger the remove callback when a key is removed", () => {
    const store = writable<Record<string, number>>({ a: 1 });
    
    const onRemoveCallback = vi.fn();
    subscribeHelper(store)
      .doOnceOnRemove(onRemoveCallback)
      .subscribe();

    // Remove the key 'a' by setting an empty record
    store.set({});

    // Expect the remove callback to be called with 'a' and 1
    expect(onRemoveCallback).toHaveBeenCalledWith("a", 1, {});
    expect(onRemoveCallback).toHaveBeenCalledTimes(1);
  });

  it.only("should trigger add and remove callbacks for multiple keys", () => {
    const store = writable<Record<string, number>>({ a: 1 });
    
    const onAddCallback = vi.fn();
    const onRemoveCallback = vi.fn();

   subscribeHelper(store)
      .doOnceOnAdd(onAddCallback)
      .doOnceOnRemove(onRemoveCallback)
      .subscribe();

    // Writable calls subscribe on initiation.
    expect(onAddCallback).toHaveBeenCalledWith("a", 1, {});
    expect(onAddCallback).toHaveBeenCalledTimes(1);
    onAddCallback.mockClear();
  
    // Update the store with a new key 'b' and remove key 'a'
    store.set({ b: 2 });

    // Expect the add callback to be called for 'b'
    expect(onAddCallback).toHaveBeenCalledWith("b", 2, {});
    expect(onAddCallback).toHaveBeenCalledTimes(1);

    // Expect the remove callback to be called for 'a'
    expect(onRemoveCallback).toHaveBeenCalledWith("a", 1, {});
    expect(onRemoveCallback).toHaveBeenCalledTimes(1);
  });

  it("should handle no-op when no changes occur", () => {
    const store = writable<Record<string, number>>({ a: 1 });
    
    const onAddCallback = vi.fn();
    const onRemoveCallback = vi.fn();

    const helper = subscribeHelper(store)
      .doOnceOnAdd(onAddCallback)
      .doOnceOnRemove(onRemoveCallback)
      .subscribe();

    // Writable calls subscribe on initiation.
    expect(onAddCallback).toHaveBeenCalledWith("a", 1, {});
    expect(onAddCallback).toHaveBeenCalledTimes(1);
    onAddCallback.mockClear();

    // Set the store to the same value (no changes)
    store.set({ a: 1 });

    // Neither callback should have been called
    expect(onAddCallback).not.toHaveBeenCalled();
    expect(onRemoveCallback).not.toHaveBeenCalled();
  });
});
