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
                    if (lastChar !== expectedChar) {
                        newState.errors = prev.errors + 1;
                        onError();
                    } else if (onSuccess) {
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
