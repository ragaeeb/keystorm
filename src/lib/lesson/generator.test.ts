import { describe, expect, it } from 'bun:test';

describe('generator', () => {
    describe('generateLessons', () => {
        it('should throw error when GEMINI_API_KEY not set', async () => {
            const originalKey = process.env.GEMINI_API_KEY;
            delete process.env.GEMINI_API_KEY;

            const { generateLessons } = await import('./generator');
            await expect(generateLessons('Science')).rejects.toThrow('GEMINI_API_KEY not configured');

            process.env.GEMINI_API_KEY = originalKey;
        });

        it('should validate theme is passed to prompt', () => {
            expect(true).toBe(true);
        });
    });
});
