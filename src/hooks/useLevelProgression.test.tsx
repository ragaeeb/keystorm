import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, renderHook } from '@testing-library/react';
import type { Dispatch, SetStateAction } from 'react';
import type { GameStats } from '@/lib/stats';
import type { LevelSummary } from '@/types/lesson';
import { useLevelProgression } from './useLevelProgression';

const baseLesson = {
    content: ['one', 'two'],
    level: 1,
    type: 'letters',
} as const;

const createStats = (overrides: Partial<GameStats> = {}): GameStats => ({
    accuracy: 90,
    errors: 1,
    wpm: 45,
    ...overrides,
});

const createDispatch = <T,>(initial: T) => {
    let state = initial;
    const dispatch = mock((value: SetStateAction<T>) => {
        state = typeof value === 'function' ? (value as (prev: T) => T)(state) : value;
    });
    return { dispatch, getState: () => state };
};

describe('useLevelProgression', () => {
    afterEach(() => {
        cleanup();
    });

    it('does nothing when game is not finished', () => {
        const setCompletedLevels = mock(() => [] as LevelSummary[]);
        const setCurrentItemIndex = mock(() => {});
        const setLevelComplete = mock(() => {});
        const setShowConfetti = mock(() => {});
        const resetGame = mock(() => {});
        const startGame = mock(() => {});

        renderHook(() =>
            useLevelProgression({
                activeLesson: baseLesson,
                currentItemIndex: 0,
                gameState: 'playing',
                levelProgressRef: { current: null },
                resetGame,
                router: { push: () => {} },
                setCompletedLevels,
                setCurrentItemIndex,
                setLevelComplete,
                setShowConfetti,
                startGame,
                stats: createStats(),
            }),
        );

        expect(setCurrentItemIndex).not.toHaveBeenCalled();
        expect(setCompletedLevels).not.toHaveBeenCalled();
    });

    it('advances to next item when level is not finished', async () => {
        const levelProgressRef = { current: null as any };
        const resetGame = mock(() => {});
        const startGame = mock(() => {});
        const setCompletedLevels = mock((updater: (prev: LevelSummary[]) => LevelSummary[]) => updater([]));
        let currentIndex = 0;
        const setCurrentItemIndex = mock((updater: (prev: number) => number) => {
            currentIndex = updater(currentIndex);
        });
        const setLevelComplete = mock(() => {});
        const setShowConfetti = mock(() => {});

        renderHook(() =>
            useLevelProgression({
                activeLesson: baseLesson,
                currentItemIndex: 0,
                gameState: 'finished',
                levelProgressRef,
                resetGame,
                router: { push: () => {} },
                setCompletedLevels,
                setCurrentItemIndex: setCurrentItemIndex as unknown as Dispatch<SetStateAction<number>>,
                setLevelComplete,
                setShowConfetti,
                startGame,
                stats: createStats({ accuracy: 80, errors: 2, wpm: 30 }),
            }),
        );

        await new Promise((resolve) => setTimeout(resolve, 300));

        expect(levelProgressRef.current).not.toBeNull();
        expect(levelProgressRef.current.totalAccuracy).toBe(80);
        expect(levelProgressRef.current.totalErrors).toBe(2);
        expect(levelProgressRef.current.totalWpm).toBe(30);

        expect(setCurrentItemIndex).toHaveBeenCalledTimes(1);
        expect(currentIndex).toBe(1);
        expect(resetGame).toHaveBeenCalledTimes(1);
        expect(startGame).toHaveBeenCalledTimes(1);
        expect(setLevelComplete).not.toHaveBeenCalled();
        expect(setShowConfetti).not.toHaveBeenCalled();
    });

    it('records completion summary on last item', () => {
        const levelProgressRef = {
            current: { items: 1, totalAccuracy: 85, totalErrors: 3, totalWpm: 60 },
        };
        let completedLevels: LevelSummary[] = [{
            averageAccuracy: 70,
            averageWpm: 20,
            items: 1,
            level: 2,
            totalAccuracy: 70,
            totalErrors: 1,
            totalWpm: 20,
            type: 'letters',
        }];
        const setCompletedLevels = mock((updater: (prev: LevelSummary[]) => LevelSummary[]) => {
            completedLevels = updater(completedLevels);
            return completedLevels;
        });
        const { dispatch: setCurrentItemIndex } = createDispatch(1);
        const { dispatch: setLevelComplete, getState: getLevelComplete } = createDispatch(false);
        const { dispatch: setShowConfetti, getState: getShowConfetti } = createDispatch(false);

        renderHook(() =>
            useLevelProgression({
                activeLesson: baseLesson,
                currentItemIndex: 1,
                gameState: 'finished',
                levelProgressRef,
                resetGame: () => {},
                router: { push: () => {} },
                setCompletedLevels: setCompletedLevels as unknown as Dispatch<SetStateAction<LevelSummary[]>>,
                setCurrentItemIndex: setCurrentItemIndex as unknown as Dispatch<SetStateAction<number>>,
                setLevelComplete: setLevelComplete as unknown as Dispatch<SetStateAction<boolean>>,
                setShowConfetti: setShowConfetti as unknown as Dispatch<SetStateAction<boolean>>,
                startGame: () => {},
                stats: createStats({ accuracy: 95, errors: 0, wpm: 70 }),
            }),
        );

        expect(levelProgressRef.current).toBeNull();
        expect(getLevelComplete()).toBe(true);
        expect(getShowConfetti()).toBe(true);
        expect(setCurrentItemIndex.mock.calls.length).toBe(0);
        expect(completedLevels).toHaveLength(2);
        const summary = completedLevels.find((item) => item.level === 1);
        expect(summary?.averageAccuracy).toBe(90);
        expect(summary?.averageWpm).toBe(65);
    });
});

