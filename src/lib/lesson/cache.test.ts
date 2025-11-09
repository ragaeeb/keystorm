import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import type { Lesson } from '@/types/lesson';

const originalEnv = { ...process.env };

let mockRedisInstance: any = null;

mock.module('@upstash/redis', () => ({
    Redis: class MockRedis {
        constructor() {
            mockRedisInstance = {
                del: mock(() => Promise.resolve(1)),
                exists: mock(() => Promise.resolve(1)),
                get: mock(() => Promise.resolve(null)),
                keys: mock(() => Promise.resolve([])),
                set: mock(() => Promise.resolve('OK')),
            };
            return mockRedisInstance;
        }
    },
}));

describe('cache', () => {
    beforeEach(() => {
        process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
        process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

        if (mockRedisInstance) {
            mockRedisInstance.get.mockClear();
            mockRedisInstance.set.mockClear();
            mockRedisInstance.del.mockClear();
            mockRedisInstance.exists.mockClear();
            mockRedisInstance.keys.mockClear();
        }

        delete require.cache[require.resolve('./cache')];
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        delete require.cache[require.resolve('./cache')];
    });

    describe('getCachedLessons', () => {
        it('should return null when Redis is not configured', async () => {
            delete process.env.UPSTASH_REDIS_REST_URL;
            delete process.env.UPSTASH_REDIS_REST_TOKEN;
            delete require.cache[require.resolve('./cache')];

            const { getCachedLessons } = await import('./cache');
            const result = await getCachedLessons('science');

            expect(result).toBeNull();
        });

        it('should return null when no cached data exists', async () => {
            mockRedisInstance.get.mockResolvedValue(null);

            const { getCachedLessons } = await import('./cache');
            const result = await getCachedLessons('science');

            expect(result).toBeNull();
            expect(mockRedisInstance.get).toHaveBeenCalledTimes(1);
        });

        it('should return cached lessons when valid data exists', async () => {
            const mockLessons: Lesson[] = [
                { content: ['a', 'b'], level: 1, type: 'letters' },
                { content: ['cat', 'dog'], level: 2, type: 'words' },
                { content: ['Alice', 'Bob'], level: 3, type: 'capitals' },
                { content: ['Hello world.'], level: 4, type: 'sentences' },
                { content: ['5 items'], level: 5, type: 'numbers' },
                { content: ['Mixed 7 case'], level: 6, type: 'mixed' },
                { content: ['Punctuation: test!'], level: 7, type: 'punctuation' },
                { content: ['Paragraph text'], level: 8, type: 'paragraphs' },
                { content: ['Advanced content'], level: 9, type: 'advanced' },
                { content: ['Expert level'], level: 10, type: 'expert' },
            ];
            mockRedisInstance.get.mockResolvedValue(mockLessons);

            const { getCachedLessons } = await import('./cache');
            const result = await getCachedLessons('science');

            expect(result).toEqual(mockLessons);
            expect(mockRedisInstance.get).toHaveBeenCalledTimes(1);
        });

        it('should return null for invalid cached structure (too few lessons)', async () => {
            mockRedisInstance.get.mockResolvedValue([{ content: ['a'], level: 1, type: 'letters' }]);

            const { getCachedLessons } = await import('./cache');
            const result = await getCachedLessons('science');

            expect(result).toBeNull();
        });

        it('should handle Redis errors gracefully', async () => {
            mockRedisInstance.get.mockRejectedValue(new Error('Redis connection failed'));

            const { getCachedLessons } = await import('./cache');
            const result = await getCachedLessons('science');

            expect(result).toBeNull();
        });
    });

    describe('cacheLessons', () => {
        it('should not cache when Redis is not configured', async () => {
            delete process.env.UPSTASH_REDIS_REST_URL;
            delete require.cache[require.resolve('./cache')];

            const { cacheLessons } = await import('./cache');
            const mockLessons: Lesson[] = [{ content: ['a'], level: 1, type: 'letters' }];

            await cacheLessons('science', mockLessons);

            expect(mockRedisInstance).toBeNull();
        });

        it('should cache lessons with correct TTL', async () => {
            const { cacheLessons } = await import('./cache');
            const mockLessons: Lesson[] = [
                { content: ['a'], level: 1, type: 'letters' },
                { content: ['cat'], level: 2, type: 'words' },
            ];

            await cacheLessons('science', mockLessons);

            expect(mockRedisInstance.set).toHaveBeenCalledTimes(1);
            const [key, value, options] = mockRedisInstance.set.mock.calls[0];
            expect(key).toContain('lessons:theme:');
            expect(key).toContain(':v1');
            expect(value).toEqual(mockLessons);
            expect(options).toEqual({ ex: 259200 });
        });

        it('should handle Redis errors gracefully without throwing', async () => {
            mockRedisInstance.set.mockRejectedValue(new Error('Redis write failed'));

            const { cacheLessons } = await import('./cache');
            const mockLessons: Lesson[] = [{ content: ['a'], level: 1, type: 'letters' }];

            await expect(cacheLessons('science', mockLessons)).resolves.toBeUndefined();
        });
    });

    describe('isCached', () => {
        it('should return false when Redis is not configured', async () => {
            delete process.env.UPSTASH_REDIS_REST_URL;
            delete require.cache[require.resolve('./cache')];

            const { isCached } = await import('./cache');
            const result = await isCached('science');

            expect(result).toBe(false);
        });

        it('should return true when cache exists', async () => {
            mockRedisInstance.exists.mockResolvedValue(1);

            const { isCached } = await import('./cache');
            const result = await isCached('science');

            expect(result).toBe(true);
            expect(mockRedisInstance.exists).toHaveBeenCalledTimes(1);
        });

        it('should return false when cache does not exist', async () => {
            mockRedisInstance.exists.mockResolvedValue(0);

            const { isCached } = await import('./cache');
            const result = await isCached('science');

            expect(result).toBe(false);
        });

        it('should return false on Redis errors', async () => {
            mockRedisInstance.exists.mockRejectedValue(new Error('Connection error'));

            const { isCached } = await import('./cache');
            const result = await isCached('science');

            expect(result).toBe(false);
        });
    });

    describe('invalidateThemeCache', () => {
        it('should not attempt to invalidate when Redis is not configured', async () => {
            delete process.env.UPSTASH_REDIS_REST_TOKEN;
            delete require.cache[require.resolve('./cache')];

            const { invalidateThemeCache } = await import('./cache');
            await invalidateThemeCache('science');

            expect(mockRedisInstance).toBeNull();
        });

        it('should delete cache key for theme', async () => {
            const { invalidateThemeCache } = await import('./cache');
            await invalidateThemeCache('science');

            expect(mockRedisInstance.del).toHaveBeenCalledTimes(1);
            const [key] = mockRedisInstance.del.mock.calls[0];
            expect(key).toContain('lessons:theme:');
            expect(key).toContain(':v1');
        });

        it('should handle errors gracefully', async () => {
            mockRedisInstance.del.mockRejectedValue(new Error('Delete failed'));

            const { invalidateThemeCache } = await import('./cache');
            await expect(invalidateThemeCache('science')).resolves.toBeUndefined();
        });
    });

    describe('getCacheStats', () => {
        it('should return empty stats when Redis is not configured', async () => {
            delete process.env.UPSTASH_REDIS_REST_URL;
            delete require.cache[require.resolve('./cache')];

            const { getCacheStats } = await import('./cache');
            const stats = await getCacheStats();

            expect(stats).toEqual({ sampleKeys: [], totalKeys: 0 });
        });

        it('should return cache statistics', async () => {
            const mockKeys = ['lessons:theme:abc123:v1', 'lessons:theme:def456:v1', 'lessons:theme:ghi789:v1'];
            mockRedisInstance.keys.mockResolvedValue(mockKeys);

            const { getCacheStats } = await import('./cache');
            const stats = await getCacheStats();

            expect(stats.totalKeys).toBe(3);
            expect(stats.sampleKeys).toEqual(mockKeys);
            expect(mockRedisInstance.keys).toHaveBeenCalledWith('lessons:theme:*:v1');
        });

        it('should limit sample keys to 10', async () => {
            const mockKeys = Array.from({ length: 15 }, (_, i) => `lessons:theme:key${i}:v1`);
            mockRedisInstance.keys.mockResolvedValue(mockKeys);

            const { getCacheStats } = await import('./cache');
            const stats = await getCacheStats();

            expect(stats.totalKeys).toBe(15);
            expect(stats.sampleKeys).toHaveLength(10);
        });

        it('should handle errors gracefully', async () => {
            mockRedisInstance.keys.mockRejectedValue(new Error('Keys fetch failed'));

            const { getCacheStats } = await import('./cache');
            const stats = await getCacheStats();

            expect(stats).toEqual({ sampleKeys: [], totalKeys: 0 });
        });
    });
});
