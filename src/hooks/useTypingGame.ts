import { useCallback, useRef, useState } from 'react';

export type TypingState = { userInput: string; startTime: number | null; errors: number; backspaceCount: number };

type UseTypingGameReturn = {
    typingState: TypingState;
    gameState: 'ready' | 'playing' | 'finished';
    inputRef: React.RefObject<HTMLInputElement | null>;
    startGame: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    resetGame: () => void;
};

/**
 * Custom hook for managing typing game state and logic
 *
 * Handles:
 * - Game state transitions (ready → playing → finished)
 * - User input tracking and validation
 * - Error counting and backspace detection
 * - Timer management for WPM calculation
 * - Audio feedback triggers
 *
 * Game completes when userInput exactly matches currentText.
 * Each keystroke is validated against expected character, triggering
 * success/error callbacks accordingly.
 *
 * @param currentText - The target text user should type
 * @param onError - Callback fired when user makes a typing error
 * @param onSuccess - Optional callback fired on each correct keystroke
 * @returns Object containing game state, input ref, and control functions
 *
 * @example
 * ```tsx
 * const { typingState, gameState, inputRef, startGame, handleInputChange } = useTypingGame(
 *   "Hello world",
 *   playErrorSound,
 *   playSuccessSound
 * );
 *
 * <input ref={inputRef} value={typingState.userInput} onChange={handleInputChange} />
 * ```
 */
export const useTypingGame = (
    currentText: string,
    onError: () => void,
    onSuccess?: () => void,
): UseTypingGameReturn => {
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
    const [typingState, setTypingState] = useState<TypingState>({
        backspaceCount: 0,
        errors: 0,
        startTime: null,
        userInput: '',
    });

    const inputRef = useRef<HTMLInputElement>(null);

    const startGame = useCallback(() => {
        setTypingState({ backspaceCount: 0, errors: 0, startTime: Date.now(), userInput: '' });
        setGameState('playing');
        setTimeout(() => inputRef.current?.focus(), 50);
    }, []);

    const resetGame = useCallback(() => {
        setTypingState({ backspaceCount: 0, errors: 0, startTime: null, userInput: '' });
        setGameState('ready');
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            const prevLength = typingState.userInput.length;

            setTypingState((prev) => {
                const newState = { ...prev, userInput: value };

                if (value.length < prevLength) {
                    newState.backspaceCount = prev.backspaceCount + 1;
                }

                if (value.length > prevLength) {
                    const lastChar = value[value.length - 1];
                    const expectedChar = currentText[value.length - 1];
                    console.log('[handleInputChange] New char typed:', {
                        expectedChar,
                        lastChar,
                        match: lastChar === expectedChar,
                    });

                    if (lastChar !== expectedChar) {
                        newState.errors = prev.errors + 1;
                        onError();
                    } else if (onSuccess) {
                        console.log('[handleInputChange] Calling onSuccess callback');

                        onSuccess();
                    }
                }

                return newState;
            });

            if (value === currentText) {
                setGameState('finished');
            }
        },
        [typingState.userInput.length, currentText, onError, onSuccess],
    );

    return { gameState, handleInputChange, inputRef, resetGame, startGame, typingState };
};
