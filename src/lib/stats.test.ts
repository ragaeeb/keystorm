import { describe, expect, it } from 'bun:test';
import { calculateGameStats } from './stats';

describe('stats', () => {
    describe('calculateGameStats', () => {
        it('should return default stats when game not started', () => {
            const result = calculateGameStats('hello', 'hello world', null, 0, 0);
            expect(result).toEqual({ accuracy: 100, errors: 0, wpm: 0 });
        });

        it('should calculate WPM correctly', () => {
            const startTime = Date.now() - 60000;
            const result = calculateGameStats('hello world test data', 'hello world test data', startTime, 0, 0);

            expect(result.wpm).toBe(4);
        });

        it('should calculate accuracy for perfect typing', () => {
            const startTime = Date.now() - 30000;
            const result = calculateGameStats('hello', 'hello world', startTime, 0, 0);

            expect(result.accuracy).toBe(100);
        });

        it('should calculate accuracy with errors', () => {
            const startTime = Date.now() - 30000;
            const result = calculateGameStats('hxllo', 'hello', startTime, 1, 0);

            expect(result.accuracy).toBeLessThan(100);
            expect(result.errors).toBe(1);
        });

        it('should apply backspace penalty to accuracy', () => {
            const startTime = Date.now() - 30000;
            const perfectResult = calculateGameStats('hello', 'hello', startTime, 0, 0);
            const withBackspace = calculateGameStats('hello', 'hello', startTime, 0, 4);

            expect(withBackspace.accuracy).toBeLessThan(perfectResult.accuracy);
        });

        it('should cap accuracy at 100', () => {
            const startTime = Date.now() - 30000;
            const result = calculateGameStats('hello', 'hello', startTime, 0, 0);

            expect(result.accuracy).toBeLessThanOrEqual(100);
        });

        it('should never return negative accuracy', () => {
            const startTime = Date.now() - 30000;
            const result = calculateGameStats('xxxxx', 'hello', startTime, 5, 20);

            expect(result.accuracy).toBeGreaterThanOrEqual(0);
        });

        it('should handle empty input', () => {
            const startTime = Date.now() - 30000;
            const result = calculateGameStats('', 'hello', startTime, 0, 0);

            expect(result.wpm).toBe(0);
            expect(result.accuracy).toBeGreaterThanOrEqual(0);
        });

        it('should calculate WPM with partial words', () => {
            const startTime = Date.now() - 60000;
            const result = calculateGameStats('hel', 'hello world', startTime, 0, 0);

            expect(result.wpm).toBe(0);
        });
    });
});
