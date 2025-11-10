import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

const originalEnv = { ...process.env };

let redisInstance: {
    expire: ReturnType<typeof mock>;
    incr: ReturnType<typeof mock>;
};
let deleteLoginCodeMock: ReturnType<typeof mock>;
let saveLoginCodeMock: ReturnType<typeof mock>;
let resendSendMock: ReturnType<typeof mock>;
let resendConstructorKey: string | null;

mock.module('@upstash/redis', () => ({
    Redis: {
        fromEnv: () => redisInstance,
    },
}));

mock.module('@/lib/redis', () => ({
    deleteLoginCode: (...args: unknown[]) => deleteLoginCodeMock(...args),
    saveLoginCode: (...args: unknown[]) => saveLoginCodeMock(...args),
}));

mock.module('resend', () => ({
    Resend: class {
        public emails = { send: resendSendMock };

        constructor(key: string) {
            resendConstructorKey = key;
        }
    },
}));

mock.module('node:crypto', () => ({
    createHash: () => {
        const chain = {
            digest: () => 'hash-value',
            update: () => chain,
        };
        return chain;
    },
    randomInt: () => 123456,
}));

describe('request-code POST route', () => {
    beforeEach(() => {
        redisInstance = {
            expire: mock(async () => 1),
            incr: mock(async () => 1),
        };
        deleteLoginCodeMock = mock(async () => {});
        saveLoginCodeMock = mock(async () => {});
        resendSendMock = mock(async () => ({ error: null }));
        resendConstructorKey = null;
        process.env = { ...originalEnv, EMAIL_FROM: 'team@example.com' };
        delete (process.env as Record<string, string | undefined>).RESEND_API_KEY;
        delete require.cache[require.resolve('./route')];
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        delete require.cache[require.resolve('./route')];
    });

    it('should reject invalid emails', async () => {
        const { POST } = await import('./route');
        const response = await POST({ json: async () => ({ email: 'invalid' }) } as any);
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: 'Invalid email' });
    });

    it('should enforce rate limits', async () => {
        redisInstance.incr.mockResolvedValueOnce(4);
        const { POST } = await import('./route');
        const response = await POST({ json: async () => ({ email: 'user@example.com' }) } as any);
        expect(response.status).toBe(429);
        expect(await response.json()).toEqual({ error: 'Too many requests' });
    });

    it('should issue codes and log when Resend is not configured', async () => {
        const { POST } = await import('./route');
        const response = await POST({ json: async () => ({ email: 'user@example.com' }) } as any);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ ok: true });
        expect(deleteLoginCodeMock).toHaveBeenCalledWith('user@example.com');
        expect(saveLoginCodeMock).toHaveBeenCalledTimes(1);
        const [emailArg, hashArg, expiresAt, ttl] = saveLoginCodeMock.mock.calls[0];
        expect(emailArg).toBe('user@example.com');
        expect(hashArg).toBe('hash-value');
        expect(typeof expiresAt).toBe('number');
        expect(ttl).toBeGreaterThan(0);
        expect(ttl).toBeLessThanOrEqual(600);
        expect(resendConstructorKey).toBeNull();
    });

    it('should send emails when Resend is configured', async () => {
        process.env.RESEND_API_KEY = 'resend-key';
        const { POST } = await import('./route');
        const response = await POST({ json: async () => ({ email: 'user@example.com' }) } as any);

        expect(response.status).toBe(200);
        expect(resendConstructorKey).toBe('resend-key');
        expect(resendSendMock).toHaveBeenCalledTimes(1);
    });

    it('should return server error when email sending fails', async () => {
        process.env.RESEND_API_KEY = 'resend-key';
        resendSendMock.mockResolvedValueOnce({ error: new Error('fail') });
        const { POST } = await import('./route');
        const response = await POST({ json: async () => ({ email: 'user@example.com' }) } as any);

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Unable to send code' });
    });
});
