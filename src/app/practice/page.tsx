'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
    type ChangeEvent,
    type FormEvent,
    type MutableRefObject,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { KeyboardVisual } from '@/components/typing/KeyboardVisual';
import { StatsDisplay } from '@/components/typing/StatsDisplay';
import { TextDisplay } from '@/components/typing/TextDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useGameStats } from '@/hooks/useGameStats';
import { useTypingGame } from '@/hooks/useTypingGame';
import { DEFAULT_ISLAMIC_LESSONS } from '@/lib/default-lessons';
import type { Lesson } from '@/types/lesson';

type ActiveLesson = Lesson & { index: number };

type LevelSummary = {
    averageAccuracy: number;
    averageWpm: number;
    items: number;
    level: number;
    totalAccuracy: number;
    totalErrors: number;
    totalWpm: number;
    type: Lesson['type'];
};

const FILTERED_DEFAULT_LESSONS = DEFAULT_ISLAMIC_LESSONS.filter((lesson) => lesson.type !== 'letters');

const usePracticeLessons = (
    router: ReturnType<typeof useRouter>,
    onReset: () => void,
): { lessons: Lesson[]; mounted: boolean } => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const storedLessons = sessionStorage.getItem('lessons');
        const lettersCompleted = sessionStorage.getItem('lettersCompleted');

        sessionStorage.removeItem('practiceSummary');
        onReset();

        if (lettersCompleted !== 'true') {
            router.replace('/practice/letters');
            return;
        }

        setMounted(true);

        if (storedLessons) {
            try {
                const parsed: Lesson[] = JSON.parse(storedLessons);
                const filtered = parsed.filter((lesson) => lesson.type !== 'letters');
                setLessons(filtered.length > 0 ? filtered : FILTERED_DEFAULT_LESSONS);
            } catch (error) {
                console.warn('Failed to parse lessons from storage', error);
                setLessons(FILTERED_DEFAULT_LESSONS);
            }
        } else {
            setLessons(FILTERED_DEFAULT_LESSONS);
        }
    }, [router, onReset]);

    return { lessons, mounted };
};

const usePersistPracticeSummary = (mounted: boolean, completedLevels: LevelSummary[]) => {
    useEffect(() => {
        if (!mounted) {
            return;
        }

        if (completedLevels.length === 0) {
            sessionStorage.removeItem('practiceSummary');
            return;
        }

        const totalItems = completedLevels.reduce((acc, level) => acc + level.items, 0);
        const totalAccuracy = completedLevels.reduce((acc, level) => acc + level.totalAccuracy, 0);
        const totalWpm = completedLevels.reduce((acc, level) => acc + level.totalWpm, 0);
        const totalErrors = completedLevels.reduce((acc, level) => acc + level.totalErrors, 0);

        const summary = {
            completedAt: new Date().toISOString(),
            levels: completedLevels,
            overall: {
                averageAccuracy: totalItems === 0 ? 0 : Math.round(totalAccuracy / totalItems),
                averageWpm: totalItems === 0 ? 0 : Math.round(totalWpm / totalItems),
                totalErrors,
                totalItems,
                totalLevels: completedLevels.length,
            },
        } satisfies {
            completedAt: string;
            levels: LevelSummary[];
            overall: {
                averageAccuracy: number;
                averageWpm: number;
                totalErrors: number;
                totalItems: number;
                totalLevels: number;
            };
        };

        sessionStorage.setItem('practiceSummary', JSON.stringify(summary));
    }, [completedLevels, mounted]);
};

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

type LevelProgressParams = {
    activeLesson: ActiveLesson | null;
    currentItemIndex: number;
    gameState: 'ready' | 'playing' | 'finished';
    levelProgressRef: MutableRefObject<{
        totalAccuracy: number;
        totalErrors: number;
        totalWpm: number;
        items: number;
    } | null>;
    resetGame: () => void;
    setCompletedLevels: React.Dispatch<React.SetStateAction<LevelSummary[]>>;
    setCurrentItemIndex: React.Dispatch<React.SetStateAction<number>>;
    setLevelComplete: React.Dispatch<React.SetStateAction<boolean>>;
    setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
    startGame: () => void;
    stats: ReturnType<typeof useGameStats>;
};

const useLevelProgression = ({
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
        resetGame,
        setCompletedLevels,
        setCurrentItemIndex,
        setLevelComplete,
        setShowConfetti,
        startGame,
        stats,
    ]);
};

type PracticeViewProps = {
    activeLesson: ActiveLesson;
    gameState: 'ready' | 'playing' | 'finished';
    handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    isLastLesson: boolean;
    levelComplete: boolean;
    nextChar: string;
    progress: number;
    showConfetti: boolean;
    startGame: () => void;
    stats: ReturnType<typeof useGameStats>;
    userInput: string;
    currentItemIndex: number;
};

const PracticeView = ({
    activeLesson,
    currentItemIndex,
    gameState,
    handleInputChange,
    handleSubmit,
    inputRef,
    isLastLesson,
    levelComplete,
    nextChar,
    progress,
    showConfetti,
    startGame,
    stats,
    userInput,
}: PracticeViewProps) => (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        {showConfetti && (
            <ConfettiBoom
                particleCount={100}
                effectCount={3}
                effectInterval={400}
                colors={['#8BC34A', '#FF5252', '#FFB74D', '#4DD0E1', '#81C784', '#EC407A', '#AB47BC', '#5C6BC0']}
            />
        )}
        <div className="mx-auto w-full max-w-6xl flex-1">
            <Card className="flex h-full flex-col">
                <CardHeader className="border-b bg-white/90 py-3 backdrop-blur">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle className="text-lg">Level {activeLesson.level}</CardTitle>
                            <CardDescription className="text-sm">
                                {gameState === 'ready'
                                    ? 'Press Enter to start'
                                    : gameState === 'playing'
                                      ? `Type the ${activeLesson.type}`
                                      : levelComplete
                                        ? isLastLesson
                                            ? 'All levels complete! Press Enter to view your summary'
                                            : 'Level complete! Press Enter for next level'
                                        : 'Keep going!'}
                            </CardDescription>
                        </div>
                        <StatsDisplay stats={stats} />
                    </div>
                    <Progress value={progress} className="mt-2" />
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden py-4">
                    <AnimatePresence mode="wait">
                        {gameState === 'ready' && (
                            <motion.div
                                key="ready"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-1 items-center justify-center"
                            >
                                <Button
                                    size="lg"
                                    onClick={startGame}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                                >
                                    Start
                                </Button>
                            </motion.div>
                        )}

                        {gameState !== 'ready' && (
                            <motion.div
                                key="playing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-1 flex-col gap-6"
                            >
                                <TextDisplay
                                    targetText={activeLesson.content[currentItemIndex]}
                                    userInput={userInput}
                                />

                                <div className="flex-1">
                                    <KeyboardVisual activeKey={nextChar} className="max-w-3xl" />
                                </div>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <Input
                                        ref={inputRef}
                                        type="text"
                                        value={userInput}
                                        onChange={handleInputChange}
                                        className="font-mono text-lg"
                                        autoFocus
                                        spellCheck={false}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                    />

                                    {levelComplete && (
                                        <div className="flex justify-center">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600"
                                            >
                                                {isLastLesson ? 'View Summary' : 'Next Level'}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    </div>
);

export default function PracticePage() {
    const router = useRouter();
    const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null);
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

    const { playErrorSound } = useAudioContext();

    const { typingState, gameState, inputRef, startGame, handleInputChange, resetGame } = useTypingGame(
        activeLesson?.content[currentItemIndex] ?? '',
        playErrorSound,
    );

    usePersistPracticeSummary(mounted, completedLevels);
    useStartGameOnEnter(gameState, startGame);

    const stats = useGameStats(typingState, activeLesson?.content[currentItemIndex] ?? '');

    useLevelProgression({
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
    });

    const progress = useMemo(() => {
        const currentText = activeLesson?.content[currentItemIndex] ?? '';
        return currentText.length > 0 ? (typingState.userInput.length / currentText.length) * 100 : 0;
    }, [activeLesson, currentItemIndex, typingState.userInput.length]);

    const nextChar = useMemo(() => {
        const currentText = activeLesson?.content[currentItemIndex] ?? '';
        return typingState.userInput.length < currentText.length ? currentText[typingState.userInput.length] : '';
    }, [activeLesson, currentItemIndex, typingState.userInput.length]);

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
