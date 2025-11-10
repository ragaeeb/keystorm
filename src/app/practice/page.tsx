'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { PracticeView } from '@/components/practice/practice-view';
import { Card } from '@/components/ui/card';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useDebugSkip } from '@/hooks/useDebugSkip';
import { useGameStats } from '@/hooks/useGameStats';
import { useTypingGame } from '@/hooks/useTypingGame';
import { getNextLevelRoute } from '@/lib/lesson/descriptions';
import { useLessonStore } from '@/store/useLessonStore';
import type { ActiveLesson, LevelSummary } from '@/types/lesson';

export default function PracticePage() {
    const router = useRouter();
    const [activeLesson, setActiveLesson] = useState<ActiveLesson>();
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [levelComplete, setLevelComplete] = useState(false);

    const loadLevel = useLessonStore((state) => state.loadLevel);
    const getLesson = useLessonStore((state) => state.getLesson);
    const isLoading = useLessonStore((state) => state.isLoading);
    const completionFlags = useLessonStore((state) => state.completionFlags);
    const addCompletedLevel = useLessonStore((state) => state.addCompletedLevel);

    const levelProgressRef = useRef<{
        totalAccuracy: number;
        totalErrors: number;
        totalWpm: number;
        items: number;
    } | null>(null);

    const { playErrorSound, playSuccessSound, playConfettiSound } = useAudioContext();

    const isLastItemOfLevel = activeLesson && currentItemIndex === activeLesson.content.length - 1;

    const { typingState, gameState, inputRef, startGame, handleInputChange, resetGame } = useTypingGame(
        activeLesson?.content[currentItemIndex] ?? '',
        playErrorSound,
        playSuccessSound,
        isLastItemOfLevel ? playConfettiSound : undefined,
    );

    const stats = useGameStats(typingState, activeLesson?.content[currentItemIndex] ?? '');

    console.log('completionFlags.lettersCompleted', completionFlags.lettersCompleted);

    useEffect(() => {
        const initializePractice = async () => {
            if (!completionFlags.lettersCompleted) {
                router.replace('/practice/letters');
                return;
            }

            let nextLevel = 2;

            if (completionFlags.capitalsCompleted) {
                nextLevel = Math.max(nextLevel, 4);
            }
            if (completionFlags.numbersCompleted) {
                nextLevel = Math.max(nextLevel, 6);
            }
            if (completionFlags.punctuationCompleted) {
                nextLevel = Math.max(nextLevel, 8);
            }

            if (nextLevel > 10) {
                router.push('/practice/summary');
                return;
            }

            console.log(`[Practice] Loading level ${nextLevel}`);
            const lesson = getLesson(nextLevel) || (await loadLevel(nextLevel));

            if (lesson) {
                setActiveLesson({ ...lesson, index: 0 });
                setCurrentItemIndex(0);
                levelProgressRef.current = null;
                setLevelComplete(false);
                setShowConfetti(false);
                resetGame();
            }
        };

        initializePractice();
    }, [completionFlags, loadLevel, getLesson, resetGame, router]);

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

            addCompletedLevel(summary);
            levelProgressRef.current = null;
            setLevelComplete(true);
            setShowConfetti(true);

            return () => {};
        }

        const timeout = setTimeout(() => {
            setCurrentItemIndex((prev) => prev + 1);
            resetGame();
            startGame();
        }, 250);
        return () => clearTimeout(timeout);
    }, [activeLesson, currentItemIndex, gameState, stats, addCompletedLevel, resetGame, startGame]);

    useEffect(() => {
        if (gameState === 'ready') {
            const handleKeyStart = (event: KeyboardEvent) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    startGame();
                }
            };
            window.addEventListener('keydown', handleKeyStart);
            return () => window.removeEventListener('keydown', handleKeyStart);
        }
    }, [gameState, startGame]);

    const currentText = activeLesson?.content[currentItemIndex] ?? '';
    const progress = currentText.length > 0 ? (typingState.userInput.length / currentText.length) * 100 : 0;
    const nextChar = typingState.userInput.length < currentText.length ? currentText[typingState.userInput.length] : '';

    const itemProgress = activeLesson ? Math.round(((currentItemIndex + 1) / activeLesson.content.length) * 100) : 0;

    const handleNext = useCallback(async () => {
        if (!activeLesson) {
            return;
        }

        setLevelComplete(false);
        setShowConfetti(false);

        // FIX: Pass both level and type
        const nextRoute = getNextLevelRoute(activeLesson.level, activeLesson.type);

        // If it's a tutorial page, navigate there
        if (nextRoute.startsWith('/learn/')) {
            router.push(nextRoute);
            return;
        }

        // If it's the summary page, navigate there
        if (nextRoute === '/practice/summary') {
            router.push('/practice/summary');
            return;
        }

        // Otherwise, load next level in /practice
        const nextLevel = activeLesson.level + 1;
        if (nextLevel <= 10) {
            const loaded = getLesson(nextLevel) || (await loadLevel(nextLevel));
            if (loaded) {
                setActiveLesson({ ...loaded, index: 0 });
                setCurrentItemIndex(0);
                levelProgressRef.current = null;
                resetGame();
                return;
            }
        }

        // Fallback
        router.push('/practice/summary');
    }, [activeLesson, loadLevel, getLesson, resetGame, router]);

    useDebugSkip({
        inputRef,
        onSkipToLast: (total) => setCurrentItemIndex(Math.max(0, total - 1)),
        onSkipToNext: () => setCurrentItemIndex((prev) => Math.min(prev + 1, (activeLesson?.content.length ?? 1) - 1)),
        onSkipToNextLevel: handleNext, // Reuse existing function
        totalItems: activeLesson?.content.length ?? 0,
    });

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (levelComplete) {
                handleNext();
            }
        },
        [levelComplete, handleNext],
    );

    if (!activeLesson || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <Card className="p-8">
                    <p className="text-center text-gray-600">Loading lessons...</p>
                </Card>
            </div>
        );
    }

    return (
        <PracticeView
            activeLesson={activeLesson}
            currentItemIndex={currentItemIndex}
            gameState={gameState}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            inputRef={inputRef}
            isLastLesson={activeLesson.level === 10}
            itemProgress={itemProgress}
            levelComplete={levelComplete}
            nextChar={nextChar}
            progress={progress}
            showConfetti={showConfetti}
            startGame={startGame}
            stats={stats}
            userInput={typingState.userInput}
        />
    );
}
