import { type RefObject, useEffect } from 'react';
import { getNextLevelRoute } from '@/lib/lesson/descriptions';
import type { ActiveLesson, LevelSummary } from '@/types/lesson';
import type { useGameStats } from './useGameStats';

type LevelProgressParams = {
    activeLesson?: ActiveLesson;
    currentItemIndex: number;
    gameState: 'ready' | 'playing' | 'finished';
    levelProgressRef: RefObject<{ totalAccuracy: number; totalErrors: number; totalWpm: number; items: number } | null>;
    playConfettiSound: () => void;
    resetGame: () => void;
    router: { push: (path: string) => void };
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
    playConfettiSound,
    resetGame,
    router,
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
            playConfettiSound();

            const tutorialRoute = getNextLevelRoute(activeLesson.type);
            if (tutorialRoute && tutorialRoute.startsWith('/learn/')) {
                const confettiTimeout = setTimeout(() => {
                    router.push(tutorialRoute);
                }, 2500);
                return () => clearTimeout(confettiTimeout);
            }

            const confettiTimeout = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(confettiTimeout);
        }

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
        playConfettiSound,
        resetGame,
        router,
        setCompletedLevels,
        setCurrentItemIndex,
        setLevelComplete,
        setShowConfetti,
        startGame,
        stats,
    ]);
};
