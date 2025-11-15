import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import type { Lesson } from '@/types/lesson';
import { usePracticeLessons } from './usePracticeLessons';

const createLesson = (level: number, type: Lesson['type']): Lesson => ({
    content: [`Item-${level}`],
    level,
    type,
});

describe('usePracticeLessons', () => {
    const storage: Record<string, string> = {};
    const sessionStorageMock: Storage = {
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

    it('redirects to letters practice when tutorial not completed', async () => {
        const replace = mock(() => {});
        const onReset = mock(() => {});
        const router = { replace } as any;

        const { result } = renderHook(() => usePracticeLessons(router, onReset));

        await waitFor(() => {
            expect(replace).toHaveBeenCalledWith('/practice?mode=letters');
        });

        expect(onReset).not.toHaveBeenCalled();
        expect(result.current.mounted).toBe(false);
        expect(result.current.lessons).toHaveLength(0);
    });

    it('loads stored lessons and filters by completion flags', async () => {
        sessionStorage.setItem('lettersCompleted', 'true');
        sessionStorage.setItem('capitalsCompleted', 'true');
        sessionStorage.setItem('numbersCompleted', 'true');
        sessionStorage.setItem('punctuationCompleted', 'true');
        sessionStorage.setItem('practiceSummary', 'temp');

        const storedLessons = [
            createLesson(1, 'letters'),
            createLesson(2, 'words'),
            createLesson(3, 'capitals'),
            createLesson(4, 'sentences'),
            createLesson(5, 'numbers'),
            createLesson(6, 'punctuation'),
            createLesson(7, 'mixed'),
            createLesson(8, 'advanced'),
        ];

        sessionStorage.setItem('lessons', JSON.stringify(storedLessons));

        const replace = mock(() => {});
        const onReset = mock(() => {});
        const router = { replace } as any;

        const { result } = renderHook(() => usePracticeLessons(router, onReset));

        await waitFor(() => {
            expect(result.current.mounted).toBe(true);
        });

        expect(onReset).toHaveBeenCalledTimes(1);
        expect(sessionStorage.getItem('practiceSummary')).toBeNull();
        expect(result.current.lessons).toEqual([createLesson(8, 'advanced')]);
        expect(replace).not.toHaveBeenCalled();
    });

    it('falls back to early lessons when storage is empty', async () => {
        sessionStorage.setItem('lettersCompleted', 'true');
        const originalFetch = globalThis.fetch;
        const fetchMock = mock(async (input: RequestInfo) => {
            const match = String(input).match(/(\d+)\.json$/);
            const level = match ? Number(match[1]) : 0;
            const typeMap: Record<number, Lesson['type']> = {
                1: 'letters',
                2: 'words',
                3: 'capitals',
                4: 'sentences',
            };
            return {
                json: async () => createLesson(level, typeMap[level] ?? 'words'),
                ok: true,
                statusText: 'OK',
            } as Response;
        });
        globalThis.fetch = fetchMock as unknown as typeof fetch;

        const replace = mock(() => {});
        const onReset = mock(() => {});
        const router = { replace } as any;

        const { result } = renderHook(() => usePracticeLessons(router, onReset));

        await waitFor(() => {
            expect(result.current.mounted).toBe(true);
        });

        expect(fetchMock).toHaveBeenCalledTimes(4);
        expect(result.current.lessons.map((lesson) => lesson.level)).toEqual([2, 3, 4]);
        expect(result.current.lessons.map((lesson) => lesson.type)).toEqual(['words', 'capitals', 'sentences']);
        expect(replace).not.toHaveBeenCalled();

        if (originalFetch) {
            globalThis.fetch = originalFetch;
        } else {
            delete (globalThis as any).fetch;
        }
    });
});

