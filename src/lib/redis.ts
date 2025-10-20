import { createHash } from 'node:crypto';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const hasRedisConfig = Boolean(redisUrl && redisToken);

const redisClient = hasRedisConfig ? new Redis({ token: redisToken!, url: redisUrl! }) : null;

type LoginCodeRecord = { codeHash: string; expiresAt: number };

type MemoryEntry = LoginCodeRecord & { timeout?: ReturnType<typeof setTimeout> };

const memoryStore = new Map<string, MemoryEntry>();

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

const setMemory = (key: string, value: LoginCodeRecord, ttlSeconds: number) => {
    const timeout = setTimeout(() => memoryStore.delete(key), ttlSeconds * 1000);
    if (typeof timeout === 'object' && 'unref' in timeout && typeof timeout.unref === 'function') {
        timeout.unref();
    }
    memoryStore.set(key, { ...value, timeout: timeout as ReturnType<typeof setTimeout> });
};

const deleteMemory = (key: string) => {
    const entry = memoryStore.get(key);
    if (entry?.timeout) {
        clearTimeout(entry.timeout);
    }
    memoryStore.delete(key);
};

const loginCodeKey = (email: string) =>
    `login-code:${createHash('sha256').update(email.trim().toLowerCase()).digest('hex')}`;

export const saveLoginCode = async (email: string, codeHash: string, expiresAt: number, ttlSeconds: number) => {
    const key = loginCodeKey(email);

    if (redisClient) {
        await redisClient.set(key, JSON.stringify({ codeHash, expiresAt }), { ex: ttlSeconds });
        return;
    }
    setMemory(key, { codeHash, expiresAt }, ttlSeconds);
};

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

export const deleteLoginCode = async (email: string) => {
    const key = loginCodeKey(email);
    if (redisClient) {
        await redisClient.del(key);
        return;
    }
    deleteMemory(key);
};

export const isRedisConfigured = () => hasRedisConfig;

export type { LoginCodeRecord };
