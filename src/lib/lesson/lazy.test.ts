import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import type { Lesson } from '@/types/lesson';
import {
    clearPrefetchCache,
    getLevelWithCache,
    loadAllLevelsProgressive,
    loadEarlyLevels,
    loadLevelFromJson,
    prefetchLevelWithCache,
    prefetchNextLevel,
} from './lazy';

const originalFetch = globalThis.fetch;
const originalWarn = console.warn;

const lessonForLevel = (level: number): Lesson => ({
    content: [`Level-${level}`],
    level,
    type: level === 1 ? 'letters' : 'words',
});

const createFetchResponse = (level: number) => ({
    json: async () => lessonForLevel(level),
    ok: true,
    statusText: 'OK',
});

describe('lesson lazy loading', () => {
    let fetchMock: ReturnType<typeof mock>;
    let warnMock: ReturnType<typeof mock>;

    beforeEach(() => {
        fetchMock = mock(async (input: RequestInfo) => {
            const match = String(input).match(/(\d+)\.json$/);
            const level = match ? Number(match[1]) : 0;
            return createFetchResponse(level);
        });
        globalThis.fetch = fetchMock as unknown as typeof fetch;
        warnMock = mock(() => {});
        console.warn = warnMock;
        clearPrefetchCache();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        console.warn = originalWarn;
        fetchMock.mockReset();
        warnMock.mockReset();
        clearPrefetchCache();
    });

    it('should load a level from JSON when fetch succeeds', async () => {
        const lesson = await loadLevelFromJson(2);
        expect(lesson).toEqual(lessonForLevel(2));
        expect(fetchMock).toHaveBeenCalledWith('/lessons/2.json');
    });

    it('should throw when the JSON fetch fails', async () => {
        fetchMock.mockImplementationOnce(async () => ({ ok: false, statusText: 'Bad Request' } as any));
        await expect(loadLevelFromJson(5)).rejects.toThrow('Failed to load level 5: Bad Request');
    });

    it('should eagerly load the first four levels', async () => {
        const lessons = await loadEarlyLevels();
        expect(lessons).toHaveLength(4);
        expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
            '/lessons/1.json',
            '/lessons/2.json',
            '/lessons/3.json',
            '/lessons/4.json',
        ]);
    });

    it('should return null when there is no next level to prefetch', async () => {
        const result = await prefetchNextLevel(10);
        expect(result).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should swallow errors when prefetching next level fails', async () => {
        fetchMock.mockRejectedValueOnce(new Error('network down'));
        const result = await prefetchNextLevel(1);
        expect(result).toBeNull();
        expect(warnMock).toHaveBeenCalledTimes(1);
    });

    it('should only prefetch a level once when cached', async () => {
        prefetchLevelWithCache(6);
        prefetchLevelWithCache(6);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should reuse cached promises when retrieving a level', async () => {
        prefetchLevelWithCache(3);
        await getLevelWithCache(3);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should load early levels and trigger prefetch for mid levels progressively', async () => {
        const lessons = await loadAllLevelsProgressive();
        expect(lessons.map((lesson) => lesson.level)).toEqual([1, 2, 3, 4]);
        const requestedLevels = fetchMock.mock.calls.map((call) => {
            const match = String(call[0]).match(/(\d+)\.json$/);
            return match ? Number(match[1]) : 0;
        });
        expect(requestedLevels).toEqual([1, 2, 3, 4, 5, 6]);
    });
});
