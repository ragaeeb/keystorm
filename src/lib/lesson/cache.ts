import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';
import type { Lesson } from '@/types/lesson';

// Use the same Redis configuration from lib/redis.ts
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasRedisConfig = Boolean(redisUrl && redisToken);
const redis = hasRedisConfig ? new Redis({ token: redisToken!, url: redisUrl! }) : null;

const CACHE_TTL = 60 * 60 * 24 * 3; // 3 days in seconds
const CACHE_VERSION = 'v1'; // Increment to invalidate all caches

/**
 * Generates a stable hash for a theme string
 * @param theme - Theme string to hash
 * @returns Hex-encoded SHA-256 hash
 */
const hashTheme = (theme: string): string => {
    return createHash('sha256').update(theme.toLowerCase().trim()).digest('hex').substring(0, 16); // First 16 chars for shorter keys
};

/**
 * Generates Redis cache key for a theme
 * @param theme - Theme string
 * @returns Cache key string
 */
const getCacheKey = (theme: string): string => {
    const hash = hashTheme(theme);
    return `lessons:theme:${hash}:${CACHE_VERSION}`;
};

/**
 * Attempts to retrieve cached lessons from Redis
 * @param theme - Theme string
 * @returns Cached lessons or null if not found/error
 */
export const getCachedLessons = async (theme: string): Promise<Lesson[] | null> => {
    if (!redis) {
        return null; // Redis not configured, skip cache
    }

    try {
        const key = getCacheKey(theme);
        const cached = await redis.get<Lesson[]>(key);

        if (!cached) {
            return null;
        }

        // Validate structure
        if (!Array.isArray(cached) || cached.length !== 10) {
            console.warn('Invalid cached lesson structure, ignoring cache');
            return null;
        }

        console.log(`[Cache HIT] Retrieved lessons for theme: ${theme}`);
        return cached;
    } catch (error) {
        console.warn('Failed to retrieve cached lessons:', error);
        return null;
    }
};

/**
 * Stores generated lessons in Redis cache
 * @param theme - Theme string
 * @param lessons - Array of lessons to cache
 */
export const cacheLessons = async (theme: string, lessons: Lesson[]): Promise<void> => {
    if (!redis) {
        return; // Redis not configured, skip cache
    }

    try {
        const key = getCacheKey(theme);
        await redis.set(key, lessons, { ex: CACHE_TTL });

        console.log(`[Cache SET] Cached lessons for theme: ${theme} (TTL: ${CACHE_TTL}s)`);
    } catch (error) {
        // Non-critical: cache failure shouldn't break lesson generation
        console.warn('Failed to cache lessons:', error);
    }
};

/**
 * Checks if lessons for a theme are cached
 * @param theme - Theme string
 * @returns True if cached, false otherwise
 */
export const isCached = async (theme: string): Promise<boolean> => {
    if (!redis) {
        return false;
    }

    try {
        const key = getCacheKey(theme);
        const exists = await redis.exists(key);
        return exists === 1;
    } catch (error) {
        return false;
    }
};

/**
 * Invalidates cache for a specific theme (admin use)
 * @param theme - Theme string
 */
export const invalidateThemeCache = async (theme: string): Promise<void> => {
    if (!redis) {
        return;
    }

    try {
        const key = getCacheKey(theme);
        await redis.del(key);
        console.log(`[Cache DEL] Invalidated cache for theme: ${theme}`);
    } catch (error) {
        console.warn('Failed to invalidate cache:', error);
    }
};

/**
 * Gets cache statistics for monitoring
 * @returns Cache stats object
 */
export const getCacheStats = async (): Promise<{ totalKeys: number; sampleKeys: string[] }> => {
    if (!redis) {
        return { sampleKeys: [], totalKeys: 0 };
    }

    try {
        const pattern = `lessons:theme:*:${CACHE_VERSION}`;
        const keys = await redis.keys(pattern);

        return {
            sampleKeys: keys.slice(0, 10), // First 10 for debugging
            totalKeys: keys.length,
        };
    } catch (error) {
        console.warn('Failed to get cache stats:', error);
        return { sampleKeys: [], totalKeys: 0 };
    }
};
