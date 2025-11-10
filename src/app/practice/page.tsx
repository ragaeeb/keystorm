'use client';

import { motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    type ChangeEvent,
    type FormEvent,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { KeyboardVisual } from '@/components/typing/KeyboardVisual';
import { PracticeView } from '@/components/practice/practice-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientProgress } from '@/components/ui/gradient-progress';
import { Input } from '@/components/ui/input';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useDebugSkip } from '@/hooks/useDebugSkip';
import { useGameStats } from '@/hooks/useGameStats';
import { useTypingGame } from '@/hooks/useTypingGame';
import { getNextLevelRoute } from '@/lib/lesson/descriptions';
import { useLessonStore } from '@/store/useLessonStore';
import type { ActiveLesson, LevelSummary } from '@/types/lesson';

type PracticeMode = 'letters' | 'capitals' | 'standard';

function LettersPractice() {
    const router = useRouter();
    const { playErrorSound, playSuccessSound, playConfettiSound } = useAudioContext();
    const [letters, setLetters] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const loadLevel = useLessonStore((state) => state.loadLevel);
    const getLesson = useLessonStore((state) => state.getLesson);
    const isLoading = useLessonStore((state) => state.isLoading);
    const setCompletionFlag = useLessonStore((state) => state.setCompletionFlag);

    const currentLetter = letters[currentIndex] ?? '';
    const isLastLetter = mounted && letters.length > 0 && currentIndex === letters.length - 1;

    const { typingState, gameState, inputRef, startGame, handleInputChange, resetGame } = useTypingGame(
        currentLetter,
        playErrorSound,
        playSuccessSound,
        isLastLetter ? playConfettiSound : undefined,
    );

    useEffect(() => {
        const loadLetters = async () => {
            const letterLesson = getLesson(1) || (await loadLevel(1));

            if (letterLesson) {
                setLetters(letterLesson.content);
            }
            setMounted(true);
        };

        loadLetters();
    }, [loadLevel, getLesson]);

    useEffect(() => {
        if (!mounted || !currentLetter || isLoading) {
            return;
        }
        resetGame();
        startGame();
        setTimeout(() => {
            const el = inputRef.current;
            el?.focus();
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }, [currentLetter, inputRef, mounted, isLoading, resetGame, startGame]);

    const progress = useMemo(() => {
        if (letters.length === 0) {
            return 0;
        }
        return Math.round(((currentIndex + (gameState === 'finished' ? 1 : 0)) / letters.length) * 100);
    }, [currentIndex, gameState, letters.length]);

    const nextChar = useMemo(() => {
        return typingState.userInput.length < currentLetter.length ? currentLetter[typingState.userInput.length] : '';
    }, [currentLetter, typingState.userInput.length]);

    const handleLetterChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value.slice(-1);
            const syntheticEvent = {
                ...event,
                currentTarget: { ...event.currentTarget, value },
                target: { ...event.target, value },
            } as ChangeEvent<HTMLInputElement>;
            handleInputChange(syntheticEvent);
        },
        [handleInputChange],
    );

    useEffect(() => {
        if (gameState !== 'finished') {
            return;
        }

        const timeout = setTimeout(() => {
            if (currentIndex < letters.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                setShowConfetti(true);
                setTimeout(() => {
                    setCompletionFlag('lettersCompleted', true);
                    const nextRoute = getNextLevelRoute(1, 'letters');
                    router.push(nextRoute);
                }, 2500);
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [currentIndex, gameState, letters.length, router, setCompletionFlag]);

    const handleSkip = useCallback(() => {
        setCompletionFlag('lettersCompleted', true);
        router.push('/practice');
    }, [router, setCompletionFlag]);

    const handleSkipToNextLevel = useCallback(() => {
        setCompletionFlag('lettersCompleted', true);
        const nextRoute = getNextLevelRoute(1, 'letters');
        router.push(nextRoute);
    }, [setCompletionFlag, router]);

    useDebugSkip({
        inputRef,
        onSkipToLast: (total) => setCurrentIndex(Math.max(0, total - 1)),
        onSkipToNext: () => setCurrentIndex((prev) => Math.min(prev + 1, letters.length - 1)),
        onSkipToNextLevel: handleSkipToNextLevel,
        totalItems: letters.length,
    });

    if (isLoading || !mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <Card className="p-8">
                    <p className="text-center text-gray-600">Loading lesson...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            {showConfetti && (
                <ConfettiBoom
                    particleCount={100}
                    effectCount={3}
                    effectInterval={400}
                    colors={['#8BC34A', '#FF5252', '#FFB74D', '#4DD0E1', '#81C784', '#EC407A', '#AB47BC', '#5C6BC0']}
                />
            )}
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
                <Card className="flex flex-1 flex-col">
                    <CardHeader className="border-b bg-white/90 py-4 backdrop-blur">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg">Letter Practice - Level 1</CardTitle>
                                <CardDescription>
                                    Type each letter as it appears. We'll advance automatically when correct.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <GradientProgress value={progress} className="w-40" />
                                <span className="text-gray-600 text-sm">{progress}%</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-6 py-6">
                        <div className="flex flex-1 flex-col items-center justify-center gap-8">
                            <motion.div
                                key={currentLetter}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 font-bold text-6xl text-white shadow-xl"
                            >
                                {currentLetter || '…'}
                            </motion.div>

                            <div className="flex w-full max-w-2xl flex-col items-center gap-4">
                                <div className="w-full max-w-2xl">
                                    <KeyboardVisual activeKey={nextChar} />
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <Input
                                        ref={inputRef}
                                        value={typingState.userInput}
                                        onChange={handleLetterChange}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        className="w-40 rounded-full border-2 border-indigo-200 text-center font-semibold text-2xl"
                                    />
                                    <p className="text-center text-gray-500 text-sm">
                                        Mistyped letters will stay on screen so you can try again.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button variant="ghost" onClick={handleSkip}>
                                Skip to words practice
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function CapitalsPractice() {
    const router = useRouter();
    const { playErrorSound, playSuccessSound, playConfettiSound } = useAudioContext();
    const [words, setWords] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const loadLevel = useLessonStore((state) => state.loadLevel);
    const getLesson = useLessonStore((state) => state.getLesson);
    const isLoading = useLessonStore((state) => state.isLoading);
    const setCompletionFlag = useLessonStore((state) => state.setCompletionFlag);

    const currentWord = words[currentIndex] ?? '';
    const isLastWord = mounted && words.length > 0 && currentIndex === words.length - 1;

    const { typingState, gameState, inputRef, startGame, handleInputChange, resetGame } = useTypingGame(
        currentWord,
        playErrorSound,
        playSuccessSound,
        isLastWord ? playConfettiSound : undefined,
    );

    useEffect(() => {
        const loadCapitals = async () => {
            const capitalsLesson = getLesson(3) || (await loadLevel(3));

            if (capitalsLesson) {
                setWords(capitalsLesson.content);
            }
            setMounted(true);
        };

        loadCapitals();
    }, [loadLevel, getLesson]);

    useEffect(() => {
        if (!mounted || !currentWord || isLoading) {
            return;
        }
        resetGame();
        startGame();
        setTimeout(() => {
            const el = inputRef.current;
            el?.focus();
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }, [currentWord, inputRef, mounted, isLoading, resetGame, startGame]);

    const progress = useMemo(() => {
        if (words.length === 0) {
            return 0;
        }
        return Math.round(((currentIndex + (gameState === 'finished' ? 1 : 0)) / words.length) * 100);
    }, [currentIndex, gameState, words.length]);

    const nextChar = useMemo(() => {
        return typingState.userInput.length < currentWord.length ? currentWord[typingState.userInput.length] : '';
    }, [currentWord, typingState.userInput.length]);

    useEffect(() => {
        if (gameState !== 'finished') {
            return;
        }

        const timeout = setTimeout(() => {
            if (currentIndex < words.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                setShowConfetti(true);
                setTimeout(() => {
                    setCompletionFlag('capitalsCompleted', true);
                    const nextRoute = getNextLevelRoute(3, 'capitals');
                    router.push(nextRoute);
                }, 2500);
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [currentIndex, gameState, words.length, router, setCompletionFlag]);

    const handleSkipToNextLevel = useCallback(() => {
        setCompletionFlag('capitalsCompleted', true);
        const nextRoute = getNextLevelRoute(3, 'capitals');
        router.push(nextRoute);
    }, [setCompletionFlag, router]);

    const handleSkip = useCallback(() => {
        setCompletionFlag('capitalsCompleted', true);
        router.push('/practice');
    }, [router, setCompletionFlag]);

    useDebugSkip({
        inputRef,
        onSkipToLast: (total) => setCurrentIndex(Math.max(0, total - 1)),
        onSkipToNext: () => setCurrentIndex((prev) => Math.min(prev + 1, words.length - 1)),
        onSkipToNextLevel: handleSkipToNextLevel,
        totalItems: words.length,
    });

    if (isLoading || !mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <Card className="p-8">
                    <p className="text-center text-gray-600">Loading lesson...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            {showConfetti && (
                <ConfettiBoom
                    particleCount={100}
                    effectCount={3}
                    effectInterval={400}
                    colors={['#8BC34A', '#FF5252', '#FFB74D', '#4DD0E1', '#81C784', '#EC407A', '#AB47BC', '#5C6BC0']}
                />
            )}
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
                <Card className="flex flex-1 flex-col">
                    <CardHeader className="border-b bg-white/90 py-4 backdrop-blur">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg">Capital Letters Practice - Level 3</CardTitle>
                                <CardDescription>
                                    Type each word with proper capitalization. Use Shift key for capital letters.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <GradientProgress value={progress} className="w-40" />
                                <span className="text-gray-600 text-sm">{progress}%</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-6 py-6">
                        <div className="flex flex-1 flex-col items-center justify-center gap-6">
                            <div className="flex flex-col items-center gap-4">
                                <motion.div
                                    key={currentWord}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className="text-gray-500 text-sm">Current word:</div>
                                    <div className="flex h-32 min-w-[200px] items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 px-6 font-bold text-5xl text-white shadow-xl">
                                        {currentWord || '…'}
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

                        <div className="flex justify-center">
                            <Button variant="ghost" onClick={handleSkip}>
                                Skip to sentence practice
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
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

        initializePractice();
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
        onSkipToNext: () =>
            setCurrentItemIndex((prev) => Math.min(prev + 1, (activeLesson?.content.length ?? 1) - 1)),
        onSkipToNextLevel: handleNext,
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

function PracticeFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <Card className="p-8">
                <p className="text-center text-gray-600">Loading practice...</p>
            </Card>
        </div>
    );
}

function PracticePageContent() {
    const searchParams = useSearchParams();
    const modeParam = (searchParams.get('mode') as PracticeMode | null) ?? 'standard';

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
        <Suspense fallback={<PracticeFallback />}>
            <PracticePageContent />
        </Suspense>
    );
}
