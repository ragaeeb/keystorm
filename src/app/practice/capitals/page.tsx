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
import { useTypingGame } from '@/hooks/useTypingGame';
import { loadLevelFromJson } from '@/lib/lesson/lazy';
import type { Lesson } from '@/types/lesson';

/**
 * CapitalsPracticePage - Level 3 capital letters practice with Shift key
 */
export default function CapitalsPracticePage() {
    const router = useRouter();
    const { playErrorSound, playSuccessSound, playConfettiSound } = useAudioContext();
    const [words, setWords] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [loading, setLoading] = useState(true);

    const currentWord = words[currentIndex] ?? '';
    const nextWord = words[currentIndex + 1] ?? '';

    const { typingState, gameState, inputRef, startGame, handleInputChange, resetGame } = useTypingGame(
        currentWord,
        playErrorSound,
        playSuccessSound,
    );

    /**
     * Load capitals lesson from sessionStorage or JSON file
     */
    useEffect(() => {
        const loadCapitals = async () => {
            try {
                // Try sessionStorage first (custom lessons)
                const storedLessons = sessionStorage.getItem('lessons');
                if (storedLessons) {
                    const parsed: Lesson[] = JSON.parse(storedLessons);
                    const capitalsLesson = parsed.find((lesson) => lesson.type === 'capitals');
                    if (capitalsLesson) {
                        setWords(capitalsLesson.content);
                        setMounted(true);
                        setLoading(false);
                        return;
                    }
                }

                // Fallback to default JSON
                const defaultLesson = await loadLevelFromJson(3);
                setWords(defaultLesson.content);
            } catch (error) {
                console.error('Failed to load capitals lesson:', error);
            } finally {
                setMounted(true);
                setLoading(false);
            }
        };

        loadCapitals();
    }, []);

    useEffect(() => {
        if (!mounted || !currentWord || loading) {
            return;
        }
        resetGame();
        startGame();
        setTimeout(() => {
            const el = inputRef.current;
            el?.focus();
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }, [currentWord, inputRef, mounted, loading, resetGame, startGame]);

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
                playConfettiSound();
                setTimeout(() => {
                    sessionStorage.setItem('capitalsCompleted', 'true');
                    router.push('/practice');
                }, 2500);
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [currentIndex, gameState, words.length, playConfettiSound, router]);

    const handleSkip = useCallback(() => {
        sessionStorage.setItem('capitalsCompleted', 'true');
        router.push('/practice');
    }, [router]);

    if (loading) {
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

                                {nextWord && (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-gray-400 text-xs">Next:</div>
                                        <div className="text-2xl text-gray-600">{nextWord}</div>
                                    </div>
                                )}
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
