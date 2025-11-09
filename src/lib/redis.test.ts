import { beforeEach, describe, expect, it, mock } from 'bun:test';

/**
 * Mock implementation of Redis client
 * Provides in-memory storage for testing without external dependencies
 */
const createMockRedis = () => {
    const store = new Map<string, { value: string; expireAt?: number }>();

    return {
        /**
         * Clears all entries from the store
         * Used for test cleanup
         */
        _clear: () => store.clear(),

        /**
         * Gets the current size of the store
         * Used for test assertions
         */
        _size: () => store.size,
        /**
         * Deletes a key from the store
         * @param key - Key to delete
         * @returns Number of keys deleted (0 or 1)
         */
        del: mock(async (key: string) => {
            const deleted = store.has(key);
            store.delete(key);
            return deleted ? 1 : 0;
        }),

        /**
         * Gets a value from the store
         * Automatically removes expired keys
         * @param key - Key to retrieve
         * @returns Stored value or null if not found/expired
         */
        get: mock(async <T>(key: string): Promise<T | null> => {
            const entry = store.get(key);
            if (!entry) {
                return null;
            }

            if (entry.expireAt && Date.now() > entry.expireAt) {
                store.delete(key);
                return null;
            }

            try {
                return JSON.parse(entry.value) as T;
            } catch {
                return entry.value as T;
            }
        }),

        /**
         * Sets a value with optional expiration
         * @param key - Key to set
         * @param value - Value to store (will be JSON stringified)
         * @param options - Optional expiration in seconds
         * @returns 'OK' on success
         */
        set: mock(async (key: string, value: any, options?: { ex?: number }) => {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            const expireAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;
            store.set(key, { expireAt, value: stringValue });
            return 'OK';
        }),
    };
};

/**
 * Global mock Redis instance
 * Shared across all tests for consistent behavior
 */
const mockRedisInstance = createMockRedis();

/**
 * Mocks the @upstash/redis module with in-memory implementation
 * Must be called BEFORE importing the module under test
 */
mock.module('@upstash/redis', () => ({
    Redis: class MockRedis {
        /**
         * Mock constructor that ignores config
         * Returns the shared mock instance methods
         */
        constructor() {
            return mockRedisInstance;
        }

        /**
         * Mock static fromEnv method
         * Returns the shared mock instance
         */
        static fromEnv() {
            return mockRedisInstance;
        }
    },
}));

/**
 * Import redis module AFTER mocking to get mocked version
 * Dynamic import ensures mock is applied first
 */
const { deleteLoginCode, getLoginCode, isRedisConfigured, saveLoginCode } = await import('./redis');

describe('redis', () => {
    const testEmail = 'test@example.com';

    /**
     * Clear store before each test to ensure isolation
     */
    beforeEach(() => {
        mockRedisInstance._clear();
    });

    describe('saveLoginCode and getLoginCode', () => {
        it('should save and retrieve login code', async () => {
            const codeHash = 'hash123';
            const expiresAt = Date.now() + 600000;

            await saveLoginCode(testEmail, codeHash, expiresAt, 600);
            const code = await getLoginCode(testEmail);

            expect(code).not.toBeNull();
            expect(code?.codeHash).toBe(codeHash);
            expect(code?.expiresAt).toBe(expiresAt);
        });

        it('should return null for non-existent codes', async () => {
            const code = await getLoginCode('nonexistent@example.com');
            expect(code).toBeNull();
        });

        it('should handle multiple emails independently', async () => {
            const email1 = 'user1@example.com';
            const email2 = 'user2@example.com';

            await saveLoginCode(email1, 'hash1', Date.now() + 600000, 600);
            await saveLoginCode(email2, 'hash2', Date.now() + 600000, 600);

            const code1 = await getLoginCode(email1);
            const code2 = await getLoginCode(email2);

            expect(code1?.codeHash).toBe('hash1');
            expect(code2?.codeHash).toBe('hash2');

            await deleteLoginCode(email1);
            await deleteLoginCode(email2);
        });
    });

    describe('deleteLoginCode', () => {
        it('should delete login codes', async () => {
            await saveLoginCode(testEmail, 'hash123', Date.now() + 600000, 600);
            await deleteLoginCode(testEmail);

            const code = await getLoginCode(testEmail);
            expect(code).toBeNull();
        });
    });

    describe('isRedisConfigured', () => {
        it('should return boolean', () => {
            const result = isRedisConfigured();
            expect(typeof result).toBe('boolean');
        });
    });
});
