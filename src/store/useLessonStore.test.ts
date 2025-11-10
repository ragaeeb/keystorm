import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import type { Lesson, LevelSummary } from '@/types/lesson';

const originalFetch = globalThis.fetch;
let fetchMock: ReturnType<typeof mock>;

const baseLesson = (level: number): Lesson => ({
    content: [`${level}`],
    level,
    type: level === 1 ? 'letters' : 'words',
});

const importStore = async () => {
    delete require.cache[require.resolve('./useLessonStore')];
    return (await import('./useLessonStore')).useLessonStore;
};

describe('useLessonStore', () => {
    beforeEach(() => {
        fetchMock = mock(async (input: RequestInfo | URL) => {
            const match = String(input).match(/(\d+)\.json$/);
            const level = match ? Number(match[1]) : 0;
            return {
                json: async () => baseLesson(level),
                ok: true,
                statusText: 'OK',
            };
        });
        globalThis.fetch = fetchMock as unknown as typeof fetch;
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        fetchMock.mockReset();
    });

    it('should set lessons and track early lesson availability', async () => {
        const store = await importStore();
        const lessons = [baseLesson(1), baseLesson(2)];
        store.getState().setLessons(lessons);

        const state = store.getState();
        expect(state.lessons).toEqual(lessons);
        expect(Array.from(state.loadedLevels)).toEqual([1, 2]);
        expect(state.hasEarlyLessons).toBe(true);
    });

    it('should keep hasEarlyLessons true once early levels are loaded', async () => {
        const store = await importStore();
        store.getState().setLessons([baseLesson(1)]);
        store.getState().setLessons([baseLesson(5)]);
        expect(store.getState().hasEarlyLessons).toBe(true);
    });

    it('should return existing lessons without reloading', async () => {
        const store = await importStore();
        const lesson = baseLesson(1);
        store.setState({ lessons: [lesson], loadedLevels: new Set<number>() });

        const result = await store.getState().loadLevel(1);
        expect(result).toEqual(lesson);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should load new lessons when not cached', async () => {
        const store = await importStore();
        const result = await store.getState().loadLevel(3);

        expect(result).toEqual(baseLesson(3));
        const state = store.getState();
        expect(state.lessons.find((l) => l.level === 3)).toBeDefined();
        expect(state.loadedLevels.has(3)).toBe(true);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
        expect(fetchMock).toHaveBeenCalledWith('/lessons/3.json');
    });

    it('should capture errors when loading fails', async () => {
        const store = await importStore();
        fetchMock.mockImplementationOnce(async () => ({ ok: false, statusText: 'fail' } as any));

        const result = await store.getState().loadLevel(4);
        expect(result).toBeNull();
        expect(store.getState().error).toBe('Failed to load level 4: fail');
    });

    it('should add and sort completed level summaries', async () => {
        const store = await importStore();
        const summaries: LevelSummary[] = [
            { accuracy: 98, level: 2, wpm: 40 },
            { accuracy: 97, level: 1, wpm: 35 },
        ];
        summaries.forEach((summary) => store.getState().addCompletedLevel(summary));

        expect(store.getState().completedLevels.map((l) => l.level)).toEqual([1, 2]);
    });

    it('should reset progress including completion flags', async () => {
        const store = await importStore();
        store.setState({
            completedLevels: [{ accuracy: 90, level: 1, wpm: 30 }],
            completionFlags: {
                capitalsCompleted: true,
                lettersCompleted: true,
                numbersCompleted: true,
                punctuationCompleted: true,
            },
        });

        store.getState().resetProgress();
        const state = store.getState();
        expect(state.completedLevels).toHaveLength(0);
        expect(Object.values(state.completionFlags)).toEqual([false, false, false, false]);
    });

    it('should update individual completion flags', async () => {
        const store = await importStore();
        store.getState().setCompletionFlag('numbersCompleted', true);
        expect(store.getState().completionFlags.numbersCompleted).toBe(true);
    });

    it('should clear stored completion summaries and errors', async () => {
        const store = await importStore();
        store.setState({
            completedLevels: [{ accuracy: 100, level: 1, wpm: 45 }],
            error: 'boom',
        });

        store.getState().clearCompletedLevels();
        store.getState().clearError();

        const state = store.getState();
        expect(state.completedLevels).toHaveLength(0);
        expect(state.error).toBeNull();
    });

    it('should report completion and retrieve lessons by level', async () => {
        const store = await importStore();
        store.setState({ completedLevels: [{ accuracy: 95, level: 2, wpm: 50 }] });
        expect(store.getState().hasCompletedLevel(2)).toBe(true);

        store.getState().setLessons([baseLesson(5)]);
        expect(store.getState().getLesson(5)).toEqual(baseLesson(5));
    });
});
