import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

let generateContentMock: ReturnType<typeof mock>;
let setTimeoutMock: ReturnType<typeof mock>;
let capturedOptions: unknown;

mock.module('@google/genai', () => ({
    GoogleGenAI: class {
        public models = { generateContent: generateContentMock };

        constructor(options: unknown) {
            capturedOptions = options;
        }
    },
}));

mock.module('node:timers/promises', () => ({
    setTimeout: (...args: unknown[]) => setTimeoutMock(...args),
}));

describe('generateWithGemini', () => {
    beforeEach(() => {
        generateContentMock = mock(async () => ({ text: '```json\n{"message":"ok"}\n```' }));
        setTimeoutMock = mock(async () => {});
        capturedOptions = undefined;
    });

    afterEach(() => {
        generateContentMock.mockReset();
        setTimeoutMock.mockReset();
        capturedOptions = undefined;
    });

    it('should return sanitized response when validation succeeds immediately', async () => {
        const { generateWithGemini, GeminiModel } = await import('./gemini');
        const validator = mock(() => true);

        const result = await generateWithGemini('prompt', 'api-key', validator, GeminiModel.ProV2_5);

        expect(result).toBe('{"message":"ok"}');
        expect(capturedOptions).toEqual({ apiKey: 'api-key', httpOptions: { timeout: 60000 } });
        expect(generateContentMock).toHaveBeenCalledTimes(1);
        expect(validator).toHaveBeenCalledWith('{"message":"ok"}');
    });

    it('should retry until validator passes', async () => {
        const { generateWithGemini } = await import('./gemini');
        const validator = mock((text: string) => text === 'clean');

        generateContentMock.mockResolvedValueOnce({ text: 'dirty' });
        generateContentMock.mockResolvedValueOnce({ text: 'still-bad' });
        generateContentMock.mockResolvedValueOnce({ text: 'clean' });

        const result = await generateWithGemini('prompt', 'api', validator, undefined, { maxRetries: 5 });

        expect(result).toBe('clean');
        expect(generateContentMock).toHaveBeenCalledTimes(3);
        expect(setTimeoutMock).not.toHaveBeenCalled();
    });

    it('should back off when rate limited and retry', async () => {
        const { generateWithGemini } = await import('./gemini');
        const validator = mock(() => true);

        generateContentMock.mockRejectedValueOnce(new Error('429 rate limit exceeded'));
        generateContentMock.mockResolvedValueOnce({ text: 'ok' });

        const result = await generateWithGemini('prompt', 'key', validator, undefined, { maxRetries: 3 });

        expect(result).toBe('ok');
        expect(setTimeoutMock).toHaveBeenCalledWith(1000);
        expect(generateContentMock).toHaveBeenCalledTimes(2);
    });

    it('should throw last encountered error after exhausting retries', async () => {
        const { generateWithGemini } = await import('./gemini');
        const validator = mock(() => false);

        generateContentMock.mockRejectedValue(new Error('fatal'));

        await expect(generateWithGemini('prompt', 'key', validator, undefined, { maxRetries: 2 })).rejects.toThrow(
            'fatal',
        );
    });
});
