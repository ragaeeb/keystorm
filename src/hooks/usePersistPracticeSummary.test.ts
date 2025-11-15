import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { cleanup, renderHook } from '@testing-library/react';
import type { LevelSummary } from '@/types/lesson';
import { usePersistPracticeSummary } from './usePersistPracticeSummary';

type StorageMap = Record<string, string>;

const createLevel = (overrides: Partial<LevelSummary> = {}): LevelSummary => ({
    averageAccuracy: 90,
    averageWpm: 60,
    items: 2,
    level: 1,
    totalAccuracy: 180,
    totalErrors: 1,
    totalWpm: 120,
    type: 'letters',
    ...overrides,
});

describe('usePersistPracticeSummary', () => {
    const storage: StorageMap = {};
    const sessionStorageMock: Storage = {
        clear: () => {
            for (const key of Object.keys(storage)) {
                delete storage[key];
            }
        },
        getItem: (key) => (key in storage ? storage[key] : null),
        key: (index) => Object.keys(storage)[index] ?? null,
        length: 0,
        removeItem: (key) => {
            delete storage[key];
        },
        setItem: (key, value) => {
            storage[key] = value;
        },
    };

    beforeEach(() => {
        Object.assign(storage, {});
        Object.defineProperty(globalThis, 'sessionStorage', {
            configurable: true,
            value: sessionStorageMock,
        });
    });

    afterEach(() => {
        cleanup();
        sessionStorageMock.clear();
    });

    it('does nothing when not mounted', () => {
        renderHook(() => usePersistPracticeSummary(false, []));

        expect(sessionStorage.getItem('practiceSummary')).toBeNull();
    });

    it('removes summary when no levels provided', () => {
        sessionStorage.setItem('practiceSummary', 'existing');

        renderHook(() => usePersistPracticeSummary(true, []));

        expect(sessionStorage.getItem('practiceSummary')).toBeNull();
    });

    it('stores aggregated summary when levels are completed', () => {
        const levels = [
            createLevel({ level: 1, items: 2, totalAccuracy: 180, totalWpm: 120, totalErrors: 2 }),
            createLevel({ level: 2, items: 1, totalAccuracy: 90, totalWpm: 70, totalErrors: 1, type: 'words' }),
        ];

        renderHook(() => usePersistPracticeSummary(true, levels));

        const stored = sessionStorage.getItem('practiceSummary');
        expect(stored).not.toBeNull();

        const summary = JSON.parse(stored!);
        expect(summary.levels).toHaveLength(2);
        expect(summary.overall.totalLevels).toBe(2);
        expect(summary.overall.totalItems).toBe(3);
        expect(summary.overall.totalErrors).toBe(3);
        expect(summary.overall.averageWpm).toBeGreaterThan(0);
        expect(summary.completedAt).toBeDefined();
    });
});

