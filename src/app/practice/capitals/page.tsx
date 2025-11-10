'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { KeyboardVisual } from '@/components/typing/KeyboardVisual';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientProgress } from '@/components/ui/gradient-progress';
import { Input } from '@/components/ui/input';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useDebugSkip } from '@/hooks/useDebugSkip';
import { useTypingGame } from '@/hooks/useTypingGame';
import { getNextLevelRoute } from '@/lib/lesson/descriptions';
import { useLessonStore } from '@/store/useLessonStore';

export default function CapitalsPracticePage() {
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

    // Update hook call:
    useDebugSkip({
        inputRef,
        onSkipToLast: (total) => setCurrentIndex(Math.max(0, total - 1)),
        onSkipToNext: () => setCurrentIndex((prev) => Math.min(prev + 1, words.length - 1)),
        onSkipToNextLevel: handleSkipToNextLevel,
        totalItems: words.length,
    });

    const handleSkip = useCallback(() => {
        setCompletionFlag('capitalsCompleted', true);
        router.push('/practice');
    }, [router, setCompletionFlag]);

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
                                        💡 <strong>Remember:</strong> Hold Shift with your pinky while pressing the
                                        letter key
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
