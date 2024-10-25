import { writable } from 'svelte/store';

export function mapStore<Key, Val>(jsMap: Map<Key, Val>) {
	const { subscribe, update } = writable(jsMap);

	return {
		subscribe,
		set: (key: Key, val: Val) => update((m) => {
            m.set(key, val);
            return m;
        }),
        delete: (key: Key) => update((m) => {
            m.delete(key);
            return m;
        }),
		clear: () => update((m) => {
            m.clear();
            return m;
        })
	};
}
