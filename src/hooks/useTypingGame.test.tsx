import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, mock } from 'bun:test';
import type { ChangeEvent } from 'react';
import { useTypingGame } from './useTypingGame';

const createEvent = (value: string) => ({ target: { value } } as unknown as ChangeEvent<HTMLInputElement>);

describe('useTypingGame', () => {
    it('starts and resets the game', async () => {
        const { result } = renderHook(() => useTypingGame('abc', () => {}, () => {}));

        await act(async () => {
            result.current.startGame();
            await Promise.resolve();
        });

        expect(result.current.gameState).toBe('playing');
        expect(result.current.typingState.startTime).not.toBeNull();

        act(() => {
            result.current.resetGame();
        });

        expect(result.current.gameState).toBe('ready');
        expect(result.current.typingState.userInput).toBe('');
    });

    it('increments errors and backspace counts appropriately', () => {
        const { result } = renderHook(() => useTypingGame('abc', () => {}, () => {}));

        act(() => {
            result.current.startGame();
        });

        act(() => {
            result.current.handleInputChange(createEvent('x'));
        });

        expect(result.current.typingState.errors).toBe(1);
        expect(result.current.typingState.userInput).toBe('x');

        act(() => {
            result.current.handleInputChange(createEvent(''));
        });

        expect(result.current.typingState.backspaceCount).toBe(1);
    });

    it('completes successfully and updates game state', () => {
        const { result } = renderHook(() => useTypingGame('go', () => {}, () => {}));

        act(() => {
            result.current.startGame();
        });

        act(() => {
            result.current.handleInputChange(createEvent('g'));
        });

        expect(result.current.typingState.userInput).toBe('g');

        act(() => {
            result.current.handleInputChange(createEvent('go'));
        });

        expect(result.current.gameState).toBe('finished');
    });
});

