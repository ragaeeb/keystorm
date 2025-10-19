import { useMemo } from 'react';
import type { GameStats } from '@/lib/stats';
import type { TypingState } from './useTypingGame';

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
