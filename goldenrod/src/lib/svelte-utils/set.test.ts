import { SetAction, writableSet, withSubscribableActions, withSubscribableItems } from "./set";
import { describe, test, expect, vi } from "vitest";

describe("set store", () => {
    test("emits update when added", () => {
        const spy = vi.fn();
        const store = writableSet<string>([]);

        store.subscribe(spy);
        spy.mockClear();

        expect(store.add("hello")).toBe(SetAction.ADDED);
        expect(spy).toHaveBeenCalled();
    });

    test("does not emit update when item is already in the set", () => {
        const spy = vi.fn();
        const store = writableSet(["hello"]);

        store.subscribe(spy);
        spy.mockClear();

        expect(store.add("hello")).toBe(undefined);
        expect(spy).not.toHaveBeenCalled();
    });

    test("emits update when deleted", () => {
        const spy = vi.fn();
        const store = writableSet(["hello"]);

        store.subscribe(spy);
        spy.mockClear();

        expect(store.delete("hello")).toBe(SetAction.DELETED);
        expect(spy).toHaveBeenCalled();
    });

    test("does not emit update when item is not in the set", () => {
        const spy = vi.fn();
        const store = writableSet<string>([]);

        store.subscribe(spy);
        spy.mockClear();

        expect(store.delete("hello")).toBe(undefined);
        expect(spy).not.toHaveBeenCalled();
    });

    test("emits updates when toggling", () => {
        const spy = vi.fn();
        const store = writableSet<string>([]);

        store.subscribe(spy);
        spy.mockClear();

        expect(store.toggle("hello")).toBe(SetAction.ADDED);
        expect(spy).toHaveBeenCalledOnce();
        expect(store.toggle("hello")).toBe(SetAction.DELETED);
        expect(spy).toBeCalledTimes(2);       
    })
});

describe("withSubscribableActions", () => {
    describe("on add", () => {
        test("runs on add", () => {
            const spy = vi.fn();
            const store = withSubscribableActions(writableSet<string>([]));
            
            store.onAdd(spy);
            spy.mockClear();
    
            expect(store.add("hello")).toBe(SetAction.ADDED);
            expect(spy).toHaveBeenCalledWith("hello");
        });

        test("does not run when already added", () => {
            const spy = vi.fn();
            const store = withSubscribableActions(writableSet<string>(["hello"]));
            
            store.onAdd(spy);
            spy.mockClear();
    
            expect(store.add("hello")).toBe(undefined);
            expect(spy).not.toHaveBeenCalled();           
        });

        test("does not run on delete", () => {
            const spy = vi.fn();
            const store = withSubscribableActions(writableSet<string>(["hello"]));
            
            store.onAdd(spy);
            spy.mockClear();
    
            store.delete("hello");
            expect(spy).not.toHaveBeenCalled();    
        });

        test("runs on toggle", () => {
            const spy = vi.fn();
            const store = withSubscribableActions(writableSet<string>(["hello"]));
            
            store.onAdd(spy);
            spy.mockClear();
    
            store.toggle("hello");
            expect(spy).not.toHaveBeenCalled();    
            store.toggle("hello");
            expect(spy).toHaveBeenCalledWith("hello");
        });
    });
 
    describe("on delete", () => {
        test("runs on delete", () => {
            const spy = vi.fn();
            const store = withSubscribableActions(writableSet<string>(["hello"]));
            
            store.onDelete(spy);
            spy.mockClear();
    
            expect(store.delete("hello")).toBe(SetAction.DELETED);
            expect(spy).toHaveBeenCalledWith("hello");
        });

        test("does not run when already deleted", () => {
            const spy = vi.fn();
            const store = withSubscribableActions(writableSet<string>([]));
            
            store.onDelete(spy);
            spy.mockClear();
    
            expect(store.delete("hello")).toBe(undefined);
            expect(spy).not.toHaveBeenCalled();           
        });

        test("does not run on add", () => {
            const spy = vi.fn();
            const store = withSubscribableActions(writableSet<string>([]));
            
            store.onDelete(spy);
            spy.mockClear();
    
            store.add("hello");
            expect(spy).not.toHaveBeenCalled();    
        });

        test("runs on toggle", () => {
            const spy = vi.fn();
            const store = withSubscribableActions(writableSet<string>([]));
            
            store.onDelete(spy);
            spy.mockClear();
    
            store.toggle("hello");
            expect(spy).not.toHaveBeenCalled();    
            store.toggle("hello");
            expect(spy).toHaveBeenCalledWith("hello");
        });
    }); 
    
    test("runs fn on clear", () => {
        const spy = vi.fn();
        const store = withSubscribableActions(writableSet<string>([]));
        
        store.onClear(spy);
        spy.mockClear();

        store.clear();
        expect(spy).toHaveBeenCalled();
    });
});
