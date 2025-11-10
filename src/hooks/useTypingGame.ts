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
 * ... (omitted doc comments for brevity) ...
 *
 * @param currentText - The target text user should type
 * @param onError - Callback fired when user makes a typing error
 * @param onSuccess - Optional callback fired on each correct keystroke
 * @param playConfettiSound - Optional callback fired on final correct keystroke
 * @returns Object containing game state, input ref, and control functions
 *
 * ... (omitted example for brevity) ...
 */
export const useTypingGame = (
    currentText: string,
    onError: () => void,
    onSuccess: () => void,
    playConfettiSound?: () => void, // Stays optional
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
            const isFinished = value === currentText;

            // --- We'll use these to trigger side effects *after* the state update ---
            let isError = false;
            let isSuccess = false;

            setTypingState((prev) => {
                const prevLength = prev.userInput.length;
                const newState = { ...prev, userInput: value };

                if (value.length < prevLength) {
                    newState.backspaceCount = prev.backspaceCount + 1;
                }

                if (value.length > prevLength) {
                    const lastChar = value[value.length - 1];
                    const expectedChar = currentText[value.length - 1];

                    if (lastChar !== expectedChar) {
                        newState.errors = prev.errors + 1;
                        isError = true; // Mark that an error happened
                    } else {
                        isSuccess = true;
                    }
                }

                return newState;
            });

            if (isError) {
                onError();
            } else if (isSuccess) {
                if (isFinished && playConfettiSound) {
                    // If this is the last item (confetti fn is provided)
                    // and it's finished, only play confetti.
                    playConfettiSound();
                } else {
                    // Otherwise (not finished, OR finished but not last item),
                    // play the normal success sound.
                    onSuccess();
                }
            }

            if (isFinished) {
                setGameState('finished');
            }
        },
        [currentText, onError, onSuccess, playConfettiSound],
    );

    return { gameState, handleInputChange, inputRef, resetGame, startGame, typingState };
};
