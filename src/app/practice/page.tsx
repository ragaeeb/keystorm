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
import type { ActiveLesson, LevelSummary } from '@/types/lesson';

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

    const { playErrorSound, playSuccessSound, playConfettiSound } = useAudioContext();

    const { typingState, gameState, inputRef, startGame, handleInputChange, resetGame } = useTypingGame(
        activeLesson?.content[currentItemIndex] ?? '',
        playErrorSound,
        playSuccessSound,
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
        playConfettiSound,
        resetGame,
        router,
        setCompletedLevels,
        setCurrentItemIndex,
        setLevelComplete,
        setShowConfetti,
        startGame,
        stats,
    });

    const currentText = activeLesson?.content[currentItemIndex] ?? '';
    const progress = currentText.length > 0 ? (typingState.userInput.length / currentText.length) * 100 : 0;
    const nextChar = typingState.userInput.length < currentText.length ? currentText[typingState.userInput.length] : '';

    const itemProgress = activeLesson ? Math.round(((currentItemIndex + 1) / activeLesson.content.length) * 100) : 0;

    useEffect(() => {
        if (!mounted || lessons.length === 0) {
            return;
        }
        setActiveLesson({ ...lessons[0], index: 0 });
        setCurrentItemIndex(0);
        levelProgressRef.current = null;
        setLevelComplete(false);
        setShowConfetti(false);
        resetGame();
    }, [lessons, mounted, resetGame]);

    const handleNext = useCallback(() => {
        if (!activeLesson) {
            return;
        }

        setLevelComplete(false);
        setShowConfetti(false);

        if (activeLesson.index < lessons.length - 1) {
            const nextLesson = lessons[activeLesson.index + 1];
            setActiveLesson({ ...nextLesson, index: activeLesson.index + 1 });
            setCurrentItemIndex(0);
            levelProgressRef.current = null;
            resetGame();
            return;
        }

        router.push('/practice/summary');
    }, [activeLesson, lessons, resetGame, router]);

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (levelComplete) {
                handleNext();
            }
        },
        [levelComplete, handleNext],
    );

    if (!mounted || !activeLesson) {
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
            isLastLesson={activeLesson.index >= lessons.length - 1}
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
