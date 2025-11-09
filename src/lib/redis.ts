import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const hasRedisConfig = Boolean(redisUrl && redisToken);

const redisClient = hasRedisConfig ? new Redis({ token: redisToken!, url: redisUrl! }) : null;

/**
 * Stored login code data structure
 */
export type LoginCodeRecord = {
    /** SHA-256 hash of the 6-digit code */
    codeHash: string;
    /** Unix timestamp when code expires */
    expiresAt: number;
};

type MemoryEntry = LoginCodeRecord & { timeout?: ReturnType<typeof setTimeout> };

const memoryStore = new Map<string, MemoryEntry>();

/**
 * Retrieves a login code from in-memory store, checking expiration
 * @param key - Storage key for the code
 * @returns Login code record or null if not found/expired
 */
const getMemory = (key: string) => {
    const entry = memoryStore.get(key);
    if (!entry) {
        return null;
    }
    if (entry.expiresAt <= Date.now()) {
        if (entry.timeout) {
            clearTimeout(entry.timeout);
        }
        memoryStore.delete(key);
        return null;
    }
    return { codeHash: entry.codeHash, expiresAt: entry.expiresAt } satisfies LoginCodeRecord;
};

/**
 * Stores a login code in memory with automatic expiration
 * @param key - Storage key
 * @param value - Login code record
 * @param ttlSeconds - Time to live in seconds
 */
const setMemory = (key: string, value: LoginCodeRecord, ttlSeconds: number) => {
    const timeout = setTimeout(() => memoryStore.delete(key), ttlSeconds * 1000);
    if (typeof timeout === 'object' && 'unref' in timeout && typeof timeout.unref === 'function') {
        timeout.unref();
    }
    memoryStore.set(key, { ...value, timeout: timeout as ReturnType<typeof setTimeout> });
};

/**
 * Deletes a login code from memory store
 * @param key - Storage key
 */
const deleteMemory = (key: string) => {
    const entry = memoryStore.get(key);
    if (entry?.timeout) {
        clearTimeout(entry.timeout);
    }
    memoryStore.delete(key);
};

/**
 * Generates storage key for login code using hashed email
 * @param email - User email address
 * @returns Redis/memory key with format "login-code:{hash}"
 */
const loginCodeKey = (email: string) =>
    `login-code:${createHash('sha256').update(email.trim().toLowerCase()).digest('hex')}`;

/**
 * Saves a login code to Redis or memory fallback
 * @param email - User email address
 * @param codeHash - SHA-256 hash of the 6-digit code
 * @param expiresAt - Unix timestamp when code expires
 * @param ttlSeconds - Time to live in seconds for Redis expiration
 */
export const saveLoginCode = async (email: string, codeHash: string, expiresAt: number, ttlSeconds: number) => {
    const key = loginCodeKey(email);

    if (redisClient) {
        await redisClient.set(key, JSON.stringify({ codeHash, expiresAt }), { ex: ttlSeconds });
        return;
    }
    setMemory(key, { codeHash, expiresAt }, ttlSeconds);
};

/**
 * Retrieves a login code from Redis or memory fallback
 * @param email - User email address
 * @returns Login code record or null if not found/expired/invalid
 */
export const getLoginCode = async (email: string): Promise<LoginCodeRecord | null> => {
    const key = loginCodeKey(email);

    if (redisClient) {
        try {
            const parsed = await redisClient.get<LoginCodeRecord | null>(key);

            if (!parsed) {
                return null;
            }

            return parsed;
        } catch (error) {
            console.error('Failed to parse login code from Redis', error);
            await redisClient.del(key);
            return null;
        }
    }
    return getMemory(key);
};

/**
 * Deletes a login code from Redis or memory fallback
 * @param email - User email address
 */
export const deleteLoginCode = async (email: string) => {
    const key = loginCodeKey(email);
    if (redisClient) {
        await redisClient.del(key);
        return;
    }
    deleteMemory(key);
};

/**
 * Checks if Redis is properly configured with environment variables
 * @returns true if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set
 */
export const isRedisConfigured = () => hasRedisConfig;
