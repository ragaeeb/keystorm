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
 * Loads early levels (1-4) immediately for fast startup
 * These are small and needed for initial user experience
 */
export const loadEarlyLevels = async (): Promise<Lesson[]> => {
    return Promise.all([loadLevelFromJson(1), loadLevelFromJson(2), loadLevelFromJson(3), loadLevelFromJson(4)]);
};

/**
 * Prefetches the next level in background while user is practicing current level
 * Called when user clicks "Start" on a level
 * @param currentLevel - Current level number
 * @returns Promise resolving to next level lesson or null if last level
 */
export const prefetchNextLevel = async (currentLevel: number): Promise<Lesson | null> => {
    const nextLevel = currentLevel + 1;

    if (nextLevel > 10) {
        return null; // No more levels
    }

    try {
        return await loadLevelFromJson(nextLevel);
    } catch (error) {
        console.warn(`Failed to prefetch level ${nextLevel}:`, error);
        return null;
    }
};

/**
 * Cache for prefetched lessons to avoid duplicate fetches
 */
const prefetchCache = new Map<number, Promise<Lesson>>();

/**
 * Prefetch with deduplication - prevents multiple requests for same level
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
 * Gets a cached prefetched level or loads it fresh
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
 * Preload strategy: Load levels 1-4 immediately, prefetch 5-10 on demand
 * @returns Promise resolving to array of early levels (1-4)
 */
export const loadAllLevelsProgressive = async (): Promise<Lesson[]> => {
    // Load early levels immediately (required for startup)
    const earlyLevels = await loadEarlyLevels();

    // Prefetch mid levels in background (nice to have)
    prefetchLevelWithCache(5);
    prefetchLevelWithCache(6);

    // Late levels (7-10) will be loaded on-demand when user reaches them

    return earlyLevels;
};
