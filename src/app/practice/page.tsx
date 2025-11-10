'use client';

import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { SimplePracticeTemplate } from '@/components/practice/SimplePracticeTemplate';
import { PracticeView } from '@/components/practice/practice-view';
import { KeyboardVisual } from '@/components/typing/KeyboardVisual';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useGameStats } from '@/hooks/useGameStats';
import { useSimplePracticeMode } from '@/hooks/useSimplePracticeMode';
import { useDebugSkip } from '@/hooks/useDebugSkip';
import { useTypingGame } from '@/hooks/useTypingGame';
import { getNextLevelRoute } from '@/lib/lesson/descriptions';
import { useLessonStore } from '@/store/useLessonStore';
import type { ActiveLesson, LevelSummary } from '@/types/lesson';

function PracticeLoadingState({ message }: { message: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <Card className="p-8">
                <p className="text-center text-gray-600">{message}</p>
            </Card>
        </div>
    );
}

function LettersPractice() {
    const { currentItem, handleInputChange, handleSkip, inputRef, isReady, nextChar, progress, showConfetti, typingState } =
        useSimplePracticeMode({
            completionFlag: 'lettersCompleted',
            lessonType: 'letters',
            level: 1,
            restrictInputToLastCharacter: true,
            skipRoute: '/practice',
        });

    if (!isReady) {
        return <PracticeLoadingState message="Loading lesson..." />;
    }

    return (
        <SimplePracticeTemplate
            description="Type each letter as it appears. We'll advance automatically when correct."
            onSkip={handleSkip}
            progress={progress}
            showConfetti={showConfetti}
            skipLabel="Skip to words practice"
            title="Letter Practice - Level 1"
        >
            <div className="flex flex-1 flex-col items-center justify-center gap-8">
                <motion.div
                    key={currentItem}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 font-bold text-6xl text-white shadow-xl"
                >
                    {currentItem || '…'}
                </motion.div>

                <div className="flex w-full max-w-2xl flex-col items-center gap-4">
                    <div className="w-full max-w-2xl">
                        <KeyboardVisual activeKey={nextChar} />
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <Input
                            ref={inputRef}
                            value={typingState.userInput}
                            onChange={handleInputChange}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            className="w-40 rounded-full border-2 border-indigo-200 text-center font-semibold text-2xl"
                        />
                        <p className="text-center text-gray-500 text-sm">Mistyped letters will stay on screen so you can try again.</p>
                    </div>
                </div>
            </div>
        </SimplePracticeTemplate>
    );
}

function CapitalsPractice() {
    const { currentItem, handleInputChange, handleSkip, inputRef, isReady, nextChar, progress, showConfetti, typingState } =
        useSimplePracticeMode({
            completionFlag: 'capitalsCompleted',
            lessonType: 'capitals',
            level: 3,
            skipRoute: '/practice',
        });

    if (!isReady) {
        return <PracticeLoadingState message="Loading lesson..." />;
    }

    return (
        <SimplePracticeTemplate
            description="Type each word with proper capitalization. Use Shift key for capital letters."
            onSkip={handleSkip}
            progress={progress}
            showConfetti={showConfetti}
            skipLabel="Skip to sentence practice"
            title="Capital Letters Practice - Level 3"
        >
            <div className="flex flex-1 flex-col items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        key={currentItem}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="text-gray-500 text-sm">Current word:</div>
                        <div className="flex h-32 min-w-[200px] items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 px-6 font-bold text-5xl text-white shadow-xl">
                            {currentItem || '…'}
                        </div>
                    </motion.div>
                </div>

                <div className="flex w-full max-w-2xl flex-col items-center gap-4">
                    <div className="w-full max-w-2xl">
                        <KeyboardVisual activeKey={nextChar} />
                    </div>
                    <Input
                        ref={inputRef}
                        value={typingState.userInput}
                        onChange={handleInputChange}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        className="w-64 rounded-full border-2 border-indigo-200 text-center font-semibold text-2xl"
                    />
                    <div className="rounded-lg bg-blue-50 p-3 text-center text-sm">
                        <p className="text-gray-700">
                            💡 <strong>Remember:</strong> Hold Shift with your pinky while pressing the letter key
                        </p>
                    </div>
                </div>
            </div>
        </SimplePracticeTemplate>
    );
}

function StandardPractice() {
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

    useEffect(() => {
        if (isLoading) {
            return;
        }

        const initializePractice = async () => {
            if (!completionFlags.lettersCompleted) {
                router.replace('/practice?mode=letters');
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

        void initializePractice();
    }, [completionFlags, isLoading, loadLevel, getLesson, resetGame, router]);

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

        const nextRoute = getNextLevelRoute(activeLesson.level, activeLesson.type);

        if (nextRoute.startsWith('/learn/')) {
            router.push(nextRoute);
            return;
        }

        if (nextRoute === '/practice/summary') {
            router.push('/practice/summary');
            return;
        }

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

        router.push('/practice/summary');
    }, [activeLesson, loadLevel, getLesson, resetGame, router]);

    useDebugSkip({
        inputRef,
        onSkipToLast: (total) => setCurrentItemIndex(Math.max(0, total - 1)),
        onSkipToNext: () => setCurrentItemIndex((prev) => Math.min(prev + 1, (activeLesson?.content.length ?? 1) - 1)),
        onSkipToNextLevel: handleNext,
        totalItems: activeLesson?.content.length ?? 0,
    });

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (levelComplete) {
                void handleNext();
            }
        },
        [levelComplete, handleNext],
    );

    if (!activeLesson || isLoading) {
        return <PracticeLoadingState message="Loading lessons..." />;
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

function PracticePageContent() {
    const searchParams = useSearchParams();
    const modeParam = (searchParams.get('mode') as 'letters' | 'capitals' | 'standard' | null) ?? 'standard';

    if (modeParam === 'letters') {
        return <LettersPractice />;
    }

    if (modeParam === 'capitals') {
        return <CapitalsPractice />;
    }

    return <StandardPractice />;
}

export default function PracticePage() {
    return (
        <Suspense fallback={<PracticeLoadingState message="Loading practice..." />}>
            <PracticePageContent />
        </Suspense>
    );
}
