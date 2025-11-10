'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { PracticeView } from '@/components/practice/practice-view';
import { Card } from '@/components/ui/card';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useDebugSkip } from '@/hooks/useDebugSkip';
import { useGameStats } from '@/hooks/useGameStats';
import { useLevelProgression } from '@/hooks/useLevelProgression';
import { useTypingGame } from '@/hooks/useTypingGame';
import { getNextLevelRoute } from '@/lib/lesson/descriptions';
import { useLessonStore } from '@/store/useLessonStore';
import type { ActiveLesson } from '@/types/lesson';

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

    const lessons = useLessonStore((state) => state.lessons);
    const loadLevel = useLessonStore((state) => state.loadLevel);
    const isLoading = useLessonStore((state) => state.isLoading);
    const completionFlags = useLessonStore((state) => state.completionFlags);
    const completedLevels = useLessonStore((state) => state.completedLevels);
    const addCompletedLevel = useLessonStore((state) => state.addCompletedLevel);
    const resetProgress = useLessonStore((state) => state.resetProgress);

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

    useStartGameOnEnter(gameState, startGame);

    useDebugSkip(
        activeLesson?.content.length ?? 0,
        (totalItems) => setCurrentItemIndex(Math.max(0, totalItems - 1)),
        inputRef,
    );

    const stats = useGameStats(typingState, activeLesson?.content[currentItemIndex] ?? '');

    useLevelProgression({
        activeLesson,
        completedLevels,
        currentItemIndex,
        gameState,
        levelProgressRef,
        onAddCompletedLevel: addCompletedLevel,
        resetGame,
        router,
        setCurrentItemIndex,
        setLevelComplete,
        setShowConfetti,
        startGame,
        stats,
    });

    useEffect(() => {
        const initializePractice = async () => {
            if (!completionFlags.lettersCompleted) {
                router.replace('/practice/letters');
                return;
            }

            resetProgress();

            const filteredLessons = lessons.filter((lesson) => {
                if (lesson.type === 'letters') {
                    return false;
                }
                if (completionFlags.capitalsCompleted && (lesson.type === 'words' || lesson.type === 'capitals')) {
                    return false;
                }
                if (completionFlags.numbersCompleted && (lesson.type === 'sentences' || lesson.type === 'numbers')) {
                    return false;
                }
                if (
                    completionFlags.punctuationCompleted &&
                    (lesson.type === 'mixed' || lesson.type === 'punctuation')
                ) {
                    return false;
                }
                return true;
            });

            if (filteredLessons.length === 0) {
                const nextLevel = lessons.length > 0 ? Math.max(...lessons.map((l) => l.level)) + 1 : 2;
                if (nextLevel <= 10) {
                    const loaded = await loadLevel(nextLevel);
                    if (loaded) {
                        setActiveLesson({ ...loaded, index: 0 });
                        setCurrentItemIndex(0);
                        levelProgressRef.current = null;
                        setLevelComplete(false);
                        setShowConfetti(false);
                        resetGame();
                    }
                } else {
                    router.push('/practice/summary');
                }
                return;
            }

            setActiveLesson({ ...filteredLessons[0], index: 0 });
            setCurrentItemIndex(0);
            levelProgressRef.current = null;
            setLevelComplete(false);
            setShowConfetti(false);
            resetGame();
        };

        initializePractice();
    }, [completionFlags, lessons, loadLevel, resetGame, resetProgress, router]);

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

        const tutorialRoute = getNextLevelRoute(activeLesson.type);
        if (tutorialRoute?.startsWith('/learn/')) {
            router.push(tutorialRoute);
            return;
        }

        const nextLevel = activeLesson.level + 1;
        if (nextLevel <= 10) {
            const loaded = await loadLevel(nextLevel);
            if (loaded) {
                setActiveLesson({ ...loaded, index: 0 });
                setCurrentItemIndex(0);
                levelProgressRef.current = null;
                resetGame();
                return;
            }
        }

        router.push('/practice/summary');
    }, [activeLesson, loadLevel, resetGame, router]);

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
