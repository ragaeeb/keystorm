import { describe, expect, it } from 'bun:test';
import { redactText, sanitizeResponse } from './textUtils';

describe('textUtils', () => {
    describe('redactText', () => {
        it('should return redacted key when key is long enough', () => {
            expect(redactText('abcdefghijklmnop')).toBe('abcd...mnop');
        });

        it('should collapse very short keys to asterisks', () => {
            expect(redactText('short')).toBe('***');
        });
    });

    describe('sanitizeResponse', () => {
        it('should remove json code fences', () => {
            const raw = '```json\n{ "a": 1 }\n```';
            expect(sanitizeResponse(raw)).toBe('{ "a": 1 }');
        });

        it('should trim generic code fences and whitespace', () => {
            const raw = '```\nhello\n```\n';
            expect(sanitizeResponse(raw)).toBe('hello');
        });

        it('should return trimmed text when no fences exist', () => {
            expect(sanitizeResponse('  plain text  ')).toBe('plain text');
        });
    });
});
