import type { Lesson } from '@/types/lesson';

/**
 * Loads a single level's default lessons from JSON file
 * @param level - Level number (1-10)
 * @returns Promise resolving to lesson object
 */
export const loadLevelFromJson = async (level: number): Promise<Lesson> => {
    const response = await fetch(`/lessons/${level}.json`);

    if (!response.ok) {
        throw new Error(`Failed to load level ${level}: ${response.statusText}`);
    }

    return response.json();
};

/**
 * Loads early levels (1-4) immediately for fast startup.
 *
 * @returns Promise resolving to lessons for the first four levels
 */
export const loadEarlyLevels = async (): Promise<Lesson[]> => {
    return Promise.all([loadLevelFromJson(1), loadLevelFromJson(2), loadLevelFromJson(3), loadLevelFromJson(4)]);
};

/**
 * Prefetches the next level in background while the user is practicing the current level.
 *
 * @param currentLevel - Current level number
 * @returns Promise resolving to the next level lesson or null when no next level exists
 */
export const prefetchNextLevel = async (currentLevel: number): Promise<Lesson | null> => {
    const nextLevel = currentLevel + 1;

    if (nextLevel > 10) {
        return null;
    }

    try {
        return await loadLevelFromJson(nextLevel);
    } catch (error) {
        console.warn(`Failed to prefetch level ${nextLevel}:`, error);
        return null;
    }
};

/**
 * Cache for prefetched lessons to avoid duplicate fetches.
 */
const prefetchCache = new Map<number, Promise<Lesson>>();

/**
 * Prefetches a level with deduplication to prevent duplicate fetches.
 *
 * @param level - Level number to prefetch
 */
export const prefetchLevelWithCache = (level: number): void => {
    if (level > 10 || level < 1) {
        return;
    }

    if (!prefetchCache.has(level)) {
        prefetchCache.set(level, loadLevelFromJson(level));
    }
};

/**
 * Gets a cached prefetched level or loads it fresh if not cached.
 *
 * @param level - Level number
 * @returns Promise resolving to lesson
 */
export const getLevelWithCache = async (level: number): Promise<Lesson> => {
    if (prefetchCache.has(level)) {
        return prefetchCache.get(level)!;
    }

    const promise = loadLevelFromJson(level);
    prefetchCache.set(level, promise);
    return promise;
};

/**
 * Clears the internal prefetch cache. Primarily used in test environments.
 */
export const clearPrefetchCache = (): void => {
    prefetchCache.clear();
};

/**
 * Implements the preload strategy: load levels 1-4 immediately and prefetch
 * levels 5-6 in the background.
 *
 * @returns Promise resolving to the array of early levels (1-4)
 */
export const loadAllLevelsProgressive = async (): Promise<Lesson[]> => {
    const earlyLevels = await loadEarlyLevels();

    prefetchLevelWithCache(5);
    prefetchLevelWithCache(6);

    return earlyLevels;
};
