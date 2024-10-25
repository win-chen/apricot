import { describe, expect, it } from "vitest";
import { createUndoRedo } from "./undo-redo";
import { get, writable } from "svelte/store";


describe('undo redo', () => {
  it('creates an undoable point', () => {
    const undoRedo = createUndoRedo();

    const state = { color: 'red' };

    const changeColor = (color: string) => {
      state.color = color;
    };
    
    const undoableChangeColor = undoRedo.undoable(
      changeColor, 
      () => state.color,
      (color) => changeColor(color), 
    );

    undoableChangeColor('yellow');
    expect(state.color).toBe('yellow');

    undoableChangeColor('green');
    expect(state.color).toBe('green');

    undoRedo.undo();
    expect(state.color).toBe('yellow');

    undoRedo.undo();
    expect(state.color).toBe('red');

    undoRedo.redo();
    expect(state.color).toBe('yellow');

    undoableChangeColor('periwinkle');
    expect(state.color).toBe('periwinkle');

    undoRedo.redo(); // redo history cleared by undo
    expect(state.color).toBe('periwinkle');
  });

  it('limits history', () => {
    const undoRedo = createUndoRedo({ historyLength: 2 });

    const state = { color: 'red' };

    const changeColor = (color: string) => {
      state.color = color;
    };
    
    const undoableChangeColor = undoRedo.undoable(
      changeColor, 
      () => state.color,
      (color) => changeColor(color), 
    );

    undoableChangeColor('yellow');
    undoableChangeColor('green');
    undoableChangeColor('blue');
    undoableChangeColor('purple');

    expect(state.color).toBe('purple');
    undoRedo.undo();
    expect(state.color).toBe('blue');
    undoRedo.undo();
    expect(state.color).toBe('green');
    undoRedo.undo();
    expect(state.color).toBe('green');
  });

  it('passes in args to context', () => {
    const undoRedo = createUndoRedo();

    const state: { fruits: Record<string, number> } = { 
      fruits: {
        'banana': 1
      }
    }

    const addFruit = (args: { fruit: string, price: number }) => {
      const { fruit, price } = args;
      state.fruits[fruit] = price;
    };

    const deleteFruit = (fruit: string) => {
      delete state.fruits[fruit];
    };

    const undoableAddFruit = undoRedo.undoable(
      addFruit, 
      (fruitObj) => fruitObj,
      (context) => deleteFruit(context.fruit),
    )
    const undoableDeleteFruit = undoRedo.undoable(
      deleteFruit, 
      (args) => {
        const fruit = args
        const price = state.fruits[fruit];
        return { fruit, price }
      },
      (context) => addFruit({
        fruit: context.fruit,
        price: context.price
      }), 
    );

    undoableAddFruit({ fruit: 'apple', price: 2 });
    expect(state).toEqual({ 
      fruits: {
        'banana': 1,
        'apple': 2
      }
    });

    undoableDeleteFruit('banana');
    expect(state).toEqual({ 
      fruits: {
        'apple': 2
      }
  });

    undoableAddFruit({ fruit: 'peach', price: 1.5 });
    expect(state).toEqual({ 
      fruits: {
        'apple': 2,
        'peach': 1.5
      }
    });

    undoRedo.undo();
    expect(state).toEqual({ 
      fruits: {
        'apple': 2
      }
    });

    undoRedo.undo();
    expect(state).toEqual({ 
      fruits: {
        'banana': 1,
        'apple': 2
      }
    });

    undoRedo.redo();
    expect(state).toEqual({ 
      fruits: {
        'apple': 2
      }
    });

    undoRedo.redo();
    expect(state).toEqual({ 
      fruits: {
        'apple': 2,
        'peach': 1.5
      }
    });
  });

  it('snapshots stores', () => {
    const undoRedo = createUndoRedo();

    const state = { 
      color: 'red',
      count: writable(0)
    };

    const changeColor = (color: string) => {
      state.color = color;
    };
    const undoableChangeColor = undoRedo.undoable(
      changeColor, 
      () => state.color,
      (color) => changeColor(color), 
    );

    const snapshot = undoRedo.storesSnapshot([state.count]);
    snapshot.start();

    for (let i = 0; i < 100; i++) {
      state.count.set(i);
      if (i == 30) {
        undoableChangeColor("blue");
      }
    }
    snapshot.end();
    undoableChangeColor("green");

    undoRedo.undo();
    expect(state.color).toEqual('blue');
    expect(get(state.count)).toEqual(99); 
    undoRedo.undo();
    expect(state.color).toEqual('blue');
    expect(get(state.count)).toEqual(0); 
    undoRedo.undo();  
    expect(state.color).toEqual('red');
    expect(get(state.count)).toEqual(0); 

  });
});