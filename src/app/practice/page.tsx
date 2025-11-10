'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { PracticeView } from '@/components/practice/practice-view';
import { Card } from '@/components/ui/card';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useDebugSkip } from '@/hooks/useDebugSkip';
import { useGameStats } from '@/hooks/useGameStats';
import { useLevelProgression } from '@/hooks/useLevelProgression';
import { usePersistPracticeSummary } from '@/hooks/usePersistPracticeSummary';
import { usePracticeLessons } from '@/hooks/usePracticeLessons';
import { useTypingGame } from '@/hooks/useTypingGame';
import { getNextLevelRoute } from '@/lib/lesson/descriptions';
import { loadLevelFromJson } from '@/lib/lesson/lazy';
import type { ActiveLesson, Lesson, LevelSummary } from '@/types/lesson';

const useStartGameOnEnter = (gameState: 'ready' | 'playing' | 'finished', startGame: () => void) => {
    useEffect(() => {
        const handleKeyStart = (event: KeyboardEvent) => {
            if (gameState === 'ready' && event.key === 'Enter') {
                event.preventDefault();
                startGame();
            }
        };
        window.addEventListener('keydown', handleKeyStart);
        return () => window.removeEventListener('keydown', handleKeyStart);
    }, [gameState, startGame]);
};

export default function PracticePage() {
    const router = useRouter();
    const [activeLesson, setActiveLesson] = useState<ActiveLesson>();
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [levelComplete, setLevelComplete] = useState(false);
    const [completedLevels, setCompletedLevels] = useState<LevelSummary[]>([]);
    const [isLoadingNextLevel, setIsLoadingNextLevel] = useState(false);

    const levelProgressRef = useRef<{
        totalAccuracy: number;
        totalErrors: number;
        totalWpm: number;
        items: number;
    } | null>(null);

    const resetProgress = useCallback(() => {
        setCompletedLevels([]);
        levelProgressRef.current = null;
    }, []);

    const { lessons, mounted } = usePracticeLessons(router, resetProgress);
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);

    const { playErrorSound, playSuccessSound, playConfettiSound } = useAudioContext();

    // Check if this is the last item of the current level
    const isLastItemOfLevel = activeLesson && currentItemIndex === activeLesson.content.length - 1;

    const { typingState, gameState, inputRef, startGame, handleInputChange, resetGame } = useTypingGame(
        activeLesson?.content[currentItemIndex] ?? '',
        playErrorSound,
        playSuccessSound,
        isLastItemOfLevel ? playConfettiSound : undefined, // <-- Use undefined
    );

    usePersistPracticeSummary(mounted, completedLevels);
    useStartGameOnEnter(gameState, startGame);

    useDebugSkip(
        activeLesson?.content.length ?? 0,
        (totalItems) => setCurrentItemIndex(Math.max(0, totalItems - 1)),
        inputRef,
    );

    const stats = useGameStats(typingState, activeLesson?.content[currentItemIndex] ?? '');

    useLevelProgression({
        activeLesson,
        currentItemIndex,
        gameState,
        levelProgressRef,
        resetGame,
        router,
        setCompletedLevels,
        setCurrentItemIndex,
        setLevelComplete,
        setShowConfetti,
        startGame,
        stats,
    });

    useEffect(() => {
        if (mounted && lessons.length > 0) {
            setAllLessons(lessons); // Initialize with the lessons from the hook
            setActiveLesson({ ...lessons[0], index: 0 });
            setCurrentItemIndex(0);
            levelProgressRef.current = null;
            setLevelComplete(false);
            setShowConfetti(false);
            resetGame();
        }
    }, [lessons, mounted, resetGame]);

    const currentText = activeLesson?.content[currentItemIndex] ?? '';
    const progress = currentText.length > 0 ? (typingState.userInput.length / currentText.length) * 100 : 0;
    const nextChar = typingState.userInput.length < currentText.length ? currentText[typingState.userInput.length] : '';

    const itemProgress = activeLesson ? Math.round(((currentItemIndex + 1) / activeLesson.content.length) * 100) : 0;

    useEffect(() => {
        if (mounted && lessons.length > 0) {
            setAllLessons(lessons); // Initialize with the lessons from the hook
            setActiveLesson({ ...lessons[0], index: 0 });
            setCurrentItemIndex(0);
            levelProgressRef.current = null;
            setLevelComplete(false);
            setShowConfetti(false);
            resetGame();
        }
    }, [lessons, mounted, resetGame]);

    const handleNext = useCallback(async () => {
        // <-- MAKE THIS ASYNC
        if (!activeLesson) {
            return;
        }

        setLevelComplete(false);
        setShowConfetti(false);

        const tutorialRoute = getNextLevelRoute(activeLesson.type);
        if (tutorialRoute?.startsWith('/learn/')) {
            router.push(tutorialRoute);
            return;
        }

        const isLastLessonInCurrentList = activeLesson.index === allLessons.length - 1;

        // --- FIX: Dynamic loading logic ---
        if (isLastLessonInCurrentList && activeLesson.level < 10) {
            setIsLoadingNextLevel(true);
            try {
                // Load the next level's JSON file on demand
                const nextLesson = await loadLevelFromJson(activeLesson.level + 1);
                const nextLessonIndex = activeLesson.index + 1;

                setAllLessons((prev) => [...prev, nextLesson]); // Add it to our list
                setActiveLesson({ ...nextLesson, index: nextLessonIndex }); // Set it as active
                setCurrentItemIndex(0);
                levelProgressRef.current = null;
                resetGame();
            } catch (err) {
                console.error('Failed to load next level, redirecting to summary', err);
                router.push('/practice/summary'); // Failsafe
            } finally {
                setIsLoadingNextLevel(false);
            }
            return;
        }
        // --- END FIX ---

        if (activeLesson.index < allLessons.length - 1) {
            // Check against allLessons
            const nextLesson = allLessons[activeLesson.index + 1]; // Get from allLessons
            setActiveLesson({ ...nextLesson, index: activeLesson.index + 1 });
            setCurrentItemIndex(0);
            levelProgressRef.current = null;
            resetGame();
            return;
        }

        // Only go to summary if we're truly done
        router.push('/practice/summary');
    }, [activeLesson, allLessons, resetGame, router]);

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (levelComplete) {
                handleNext();
            }
        },
        [levelComplete, handleNext],
    );

    if (!mounted || !activeLesson || isLoadingNextLevel) {
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
