import { describe, expect, it } from 'bun:test';
import { renderHook } from '@testing-library/react';
import type { TypingState } from './useTypingGame';
import { useGameStats } from './useGameStats';

const createState = (overrides: Partial<TypingState> = {}): TypingState => ({
    backspaceCount: 0,
    errors: 0,
    startTime: null,
    userInput: '',
    ...overrides,
});

describe('useGameStats', () => {
    it('returns defaults when game has not started', () => {
        const { result } = renderHook(() => useGameStats(createState(), 'example'));

        expect(result.current).toEqual({ accuracy: 100, errors: 0, wpm: 0 });
    });

    it('computes statistics with accuracy penalty', () => {
        const startTime = Date.now() - 60_000; // 1 minute elapsed
        const state = createState({
            backspaceCount: 2,
            errors: 3,
            startTime,
            userInput: 'hello worl',
        });

        const { result } = renderHook(() => useGameStats(state, 'hello world'));

        expect(result.current.wpm).toBe(2); // two words per minute
        expect(result.current.errors).toBe(3);
        expect(result.current.accuracy).toBeLessThan(100);
        expect(result.current.accuracy).toBeGreaterThan(0);
    });
});

