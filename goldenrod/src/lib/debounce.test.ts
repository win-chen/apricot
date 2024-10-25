import { describe, it, expect, vi } from 'vitest';
import { debounce } from './debounce'; // Assuming the debounce function is in a file named debounce.js

class TestClass {
  count = 0;

  @debounce(100)
  debouncedMethod() {
    this.count++;
  }
}

vi.useFakeTimers();

describe('debounce decorator', () => {
  it('should call debounced method once within given interval per instance', () => {
    const instance1 = new TestClass();
    const instance2 = new TestClass();

    // Call debounced method multiple times in quick succession for both instances
    instance1.debouncedMethod();
    instance1.debouncedMethod();
    instance1.debouncedMethod();

    instance2.debouncedMethod();
    instance2.debouncedMethod();

    // Fast-forward time
    vi.advanceTimersByTime(100);

    // Check that each instance's method was called only once
    expect(instance1.count).toBe(1);
    expect(instance2.count).toBe(1);

    // Call debounced method again after the interval
    instance1.debouncedMethod();
    instance2.debouncedMethod();

    // Fast-forward time again
    vi.advanceTimersByTime(100);

    // Check that each instance's method was called once more
    expect(instance1.count).toBe(2);
    expect(instance2.count).toBe(2);
  });

  it('should not call debounced method more than once within the interval for a single instance', () => {
    const instance = new TestClass();

    // Call debounced method multiple times in quick succession
    instance.debouncedMethod();
    instance.debouncedMethod();
    instance.debouncedMethod();

    // Fast-forward time
    vi.advanceTimersByTime(100);

    // Check that the method was called only once
    expect(instance.count).toBe(1);

    // Call debounced method again after the interval
    instance.debouncedMethod();
    vi.advanceTimersByTime(100);

    // Check that the method was called again
    expect(instance.count).toBe(2);
  });
});