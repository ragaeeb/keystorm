import { type RefObject, useEffect } from 'react';
// We no longer need getNextLevelRoute here
import type { ActiveLesson, LevelSummary } from '@/types/lesson';
import type { useGameStats } from './useGameStats';

type LevelProgressParams = {
    activeLesson?: ActiveLesson;
    currentItemIndex: number;
    gameState: 'ready' | 'playing' | 'finished';
    levelProgressRef: RefObject<{ totalAccuracy: number; totalErrors: number; totalWpm: number; items: number } | null>;
    resetGame: () => void;
    router: { push: (path: string) => void }; // router is still needed by the type, but not used in the logic we're changing
    setCompletedLevels: React.Dispatch<React.SetStateAction<LevelSummary[]>>;
    setCurrentItemIndex: React.Dispatch<React.SetStateAction<number>>;
    setLevelComplete: React.Dispatch<React.SetStateAction<boolean>>;
    setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
    startGame: () => void;
    stats: ReturnType<typeof useGameStats>;
};

export const useLevelProgression = ({
    activeLesson,
    currentItemIndex,
    gameState,
    levelProgressRef,
    resetGame,
    router, // linter may complain it's unused, that's fine for now
    setCompletedLevels,
    setCurrentItemIndex,
    setLevelComplete,
    setShowConfetti,
    startGame,
    stats,
}: LevelProgressParams) => {
    useEffect(() => {
        if (gameState !== 'finished' || !activeLesson) {
            return;
        }

        if (!levelProgressRef.current) {
            levelProgressRef.current = { items: 0, totalAccuracy: 0, totalErrors: 0, totalWpm: 0 };
        }
        levelProgressRef.current.totalAccuracy += stats.accuracy;
        levelProgressRef.current.totalErrors += stats.errors;
        levelProgressRef.current.totalWpm += stats.wpm;
        levelProgressRef.current.items += 1;

        const isLastItemInLevel = currentItemIndex === activeLesson.content.length - 1;

        if (isLastItemInLevel) {
            const totals = levelProgressRef.current;
            if (!totals) {
                return;
            }
            const averageAccuracy = Math.round(totals.totalAccuracy / Math.max(totals.items, 1));
            const averageWpm = Math.round(totals.totalWpm / Math.max(totals.items, 1));

            const summary: LevelSummary = {
                averageAccuracy,
                averageWpm,
                items: totals.items,
                level: activeLesson.level,
                totalAccuracy: totals.totalAccuracy,
                totalErrors: totals.totalErrors,
                totalWpm: totals.totalWpm,
                type: activeLesson.type,
            };

            setCompletedLevels((prev) => {
                const filtered = prev.filter((level) => level.level !== activeLesson.level);
                return [...filtered, summary].sort((a, b) => a.level - b.level);
            });

            levelProgressRef.current = null;
            setLevelComplete(true);
            setShowConfetti(true);

            // --- REMOVED TIMER LOGIC ---
            // The logic to navigate or hide confetti will now be handled
            // by the 'handleNext' function in the page, which is
            // triggered by the "Enter" key press on the PracticeView.

            // We must return a cleanup function.
            return () => {};
        }

        // This part is for moving between items *within* a level,
        // so this timeout is correct.
        const timeout = setTimeout(() => {
            setCurrentItemIndex((prev) => prev + 1);
            resetGame();
            startGame();
        }, 250);
        return () => clearTimeout(timeout);
    }, [
        activeLesson,
        currentItemIndex,
        gameState,
        levelProgressRef,
        resetGame,
        setCompletedLevels,
        setCurrentItemIndex,
        setLevelComplete,
        setShowConfetti,
        startGame,
        stats,
    ]);
};
