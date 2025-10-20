'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { KeyboardVisual } from '@/components/typing/KeyboardVisual';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useTypingGame } from '@/hooks/useTypingGame';
import { DEFAULT_ISLAMIC_LESSONS } from '@/lib/default-lessons';
import type { Lesson } from '@/types/lesson';

const LETTER_LESSON = DEFAULT_ISLAMIC_LESSONS.find((lesson) => lesson.type === 'letters');

export default function LetterPracticePage() {
    const router = useRouter();
    const { playErrorSound } = useAudioContext();
    const [letters, setLetters] = useState<string[]>(LETTER_LESSON?.content ?? []);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const currentLetter = letters[currentIndex] ?? '';

    const { typingState, gameState, inputRef, startGame, handleInputChange, resetGame } = useTypingGame(
        currentLetter,
        playErrorSound,
    );

    useEffect(() => {
        const storedLessons = sessionStorage.getItem('lessons');
        if (storedLessons) {
            try {
                const parsed: Lesson[] = JSON.parse(storedLessons);
                const letterLesson = parsed.find((lesson) => lesson.type === 'letters');
                if (letterLesson) {
                    setLetters(letterLesson.content);
                }
            } catch (error) {
                console.warn('Failed to parse stored lessons for letters', error);
            }
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !currentLetter) {
            return;
        }
        resetGame();
        startGame();
        const element = inputRef.current;
        setTimeout(() => element?.focus(), 100);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [currentLetter, inputRef, mounted, resetGame, startGame]);

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
        (event: React.ChangeEvent<HTMLInputElement>) => {
            event.persist?.();
            const value = event.target.value.slice(-1);
            const syntheticEvent = {
                ...event,
                currentTarget: { ...event.currentTarget, value },
                target: { ...event.target, value },
            } as React.ChangeEvent<HTMLInputElement>;
            handleInputChange(syntheticEvent);
        },
        [handleInputChange],
    );

    useEffect(() => {
        if (gameState !== 'finished') {
            return;
        }

        // Show confetti for perfect letter completion (no errors)
        if (typingState.errors === 0) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
        }

        const timeout = setTimeout(() => {
            if (currentIndex < letters.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                sessionStorage.setItem('lettersCompleted', 'true');
                router.push('/practice');
            }
        }, 250);

        return () => clearTimeout(timeout);
    }, [currentIndex, gameState, letters.length, router, typingState.errors]);

    const handleSkip = useCallback(() => {
        sessionStorage.setItem('lettersCompleted', 'true');
        router.push('/practice');
    }, [router]);

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            {showConfetti && (
                <ConfettiBoom
                    particleCount={50}
                    effectCount={2}
                    effectInterval={300}
                    colors={['#8BC34A', '#FF5252', '#FFB74D', '#4DD0E1', '#81C784', '#EC407A', '#AB47BC', '#5C6BC0']}
                />
            )}
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
                <Card className="flex flex-1 flex-col">
                    <CardHeader className="border-b bg-white/90 py-4 backdrop-blur">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg">Letter Practice</CardTitle>
                                <CardDescription>
                                    Type the highlighted letter. We will advance automatically when you get it right.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <Progress value={progress} className="w-40" />
                                <span className="text-gray-600 text-sm">{progress}%</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-6 py-6">
                        <div className="flex flex-1 flex-col items-center justify-center gap-6 md:flex-row md:items-stretch">
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
                                <p className="text-gray-500 text-sm">
                                    Mistyped letters will stay on screen so you can try again.
                                </p>
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
