import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

type StorageShape = Record<string, string>;

const storage: StorageShape = {};

const localStorageMock: Storage = {
    clear: () => {
        for (const key of Object.keys(storage)) {
            delete storage[key];
        }
    },
    getItem: (key) => storage[key] ?? null,
    key: (index) => Object.keys(storage)[index] ?? null,
    length: 0,
    removeItem: (key) => {
        delete storage[key];
    },
    setItem: mock((key: string, value: string) => {
        storage[key] = value;
    }),
};

const importStore = async () => {
    const module = await import('./useUserStore');
    const store = module.useUserStore;
    store.persist?.clearStorage?.();
    store.setState({ name: '', theme: 'Islam' });
    return store;
};

describe('useUserStore', () => {
    beforeEach(() => {
        Object.defineProperty(globalThis, 'localStorage', {
            configurable: true,
            value: localStorageMock,
        });
        localStorageMock.clear();
        (localStorageMock.setItem as ReturnType<typeof mock>).mockClear();
    });

    afterEach(() => {
        localStorageMock.clear();
    });

    it('trims and sets user name', async () => {
        const store = await importStore();

        store.getState().setName('  Storm ');
        expect(store.getState().name).toBe('Storm');
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('trims and sets theme', async () => {
        const store = await importStore();

        store.getState().setTheme('  Space  ');
        expect(store.getState().theme).toBe('Space');
    });

    it('clears profile to defaults', async () => {
        const store = await importStore();

        store.setState({ name: 'Existing', theme: 'Galaxy' });
        store.getState().clearProfile();

        expect(store.getState().name).toBe('');
        expect(store.getState().theme).toBe('Islam');
    });
});

