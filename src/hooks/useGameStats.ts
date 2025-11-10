import { useMemo } from 'react';
import type { GameStats } from '@/lib/stats';
import type { TypingState } from './useTypingGame';

/**
 * Custom hook for calculating real-time typing game statistics
 *
 * Computes WPM, accuracy, and tracks errors based on user input and elapsed time.
 * Accuracy calculation includes penalty for backspace usage to discourage corrections.
 *
 * @param state - Current typing state from useTypingGame
 * @param targetText - The text the user is attempting to type
 * @returns Game statistics object with wpm, accuracy, and errors
 *
 * @example
 * ```tsx
 * const stats = useGameStats(typingState, "Hello world");
 * console.log(`WPM: ${stats.wpm}, Accuracy: ${stats.accuracy}%`);
 * ```
 */
export const useGameStats = (state: TypingState, targetText: string): GameStats => {
    return useMemo(() => {
        const { userInput, startTime, errors, backspaceCount } = state;

        if (!startTime) {
            return { accuracy: 100, errors, wpm: 0 };
        }

        const timeElapsed = Date.now() - startTime;
        const words = userInput.trim().split(' ').filter(Boolean).length || 0;
        const minutes = Math.max(timeElapsed / 60000, 0.001);
        const wpm = Math.round(words / minutes) || 0;

        let correctChars = 0;
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] === targetText[i]) {
                correctChars++;
            }
        }
        const totalChars = userInput.length || 1;
        const errorPenalty = backspaceCount * 0.5;
        const accuracy = Math.max(0, Math.round((correctChars / totalChars) * 100 - errorPenalty));

        return { accuracy, errors, wpm };
    }, [state, targetText]);
};
