import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { deleteLoginCode, getLoginCode, isRedisConfigured, saveLoginCode } from './redis';

describe('redis', () => {
    const testEmail = 'test@example.com';

    beforeEach(async () => {
        await deleteLoginCode(testEmail);
    });

    afterEach(async () => {
        await deleteLoginCode(testEmail);
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

        it('should return null for expired codes', async () => {
            const codeHash = 'hash123';
            const expiresAt = Date.now() - 1000;

            await saveLoginCode(testEmail, codeHash, expiresAt, 1);
            await new Promise((resolve) => setTimeout(resolve, 100));

            const code = await getLoginCode(testEmail);
            expect(code).toBeNull();
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

        it('should handle deleting non-existent codes', async () => {
            await expect(deleteLoginCode('nonexistent@example.com')).resolves.not.toThrow();
        });
    });

    describe('isRedisConfigured', () => {
        it('should return boolean', () => {
            const result = isRedisConfigured();
            expect(typeof result).toBe('boolean');
        });
    });
});
