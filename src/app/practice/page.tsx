'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
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

export default function PracticePage() {
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    const { playErrorSound } = useAudioContext();

    const { typingState, gameState, inputRef, startGame, handleInputChange, resetGame } = useTypingGame(
        activeLesson?.content[currentItemIndex] ?? '',
        playErrorSound,
    );

    const stats = useGameStats(typingState, activeLesson?.content[currentItemIndex] ?? '');
    const progress = useMemo(() => {
        const currentText = activeLesson?.content[currentItemIndex] ?? '';
        return currentText.length > 0 ? (typingState.userInput.length / currentText.length) * 100 : 0;
    }, [activeLesson, currentItemIndex, typingState.userInput.length]);

    const nextChar = useMemo(() => {
        const currentText = activeLesson?.content[currentItemIndex] ?? '';
        return typingState.userInput.length < currentText.length ? currentText[typingState.userInput.length] : '';
    }, [activeLesson, currentItemIndex, typingState.userInput.length]);

    useEffect(() => {
        const storedLessons = sessionStorage.getItem('lessons');
        const lettersCompleted = sessionStorage.getItem('lettersCompleted');
        if (lettersCompleted !== 'true') {
            router.replace('/practice/letters');
            return;
        }

        setMounted(true);
        if (storedLessons) {
            try {
                const parsed: Lesson[] = JSON.parse(storedLessons);
                const filtered = parsed.filter((lesson) => lesson.type !== 'letters');
                setLessons(
                    filtered.length > 0 ? filtered : DEFAULT_ISLAMIC_LESSONS.filter((l) => l.type !== 'letters'),
                );
            } catch (error) {
                console.warn('Failed to parse lessons from storage', error);
                setLessons(DEFAULT_ISLAMIC_LESSONS.filter((l) => l.type !== 'letters'));
            }
        } else {
            setLessons(DEFAULT_ISLAMIC_LESSONS.filter((l) => l.type !== 'letters'));
        }
    }, [router]);

    useEffect(() => {
        if (!mounted || lessons.length === 0) {
            return;
        }
        setActiveLesson({ ...lessons[0], index: 0 });
        setCurrentItemIndex(0);
        resetGame();
    }, [lessons, mounted, resetGame]);

    useEffect(() => {
        const handleKeyStart = (e: KeyboardEvent) => {
            if (gameState === 'ready' && e.key === 'Enter') {
                e.preventDefault();
                startGame();
            }
        };
        window.addEventListener('keydown', handleKeyStart);
        return () => window.removeEventListener('keydown', handleKeyStart);
    }, [gameState, startGame]);

    const handleNext = useCallback(() => {
        if (!activeLesson) {
            return;
        }
        if (currentItemIndex < activeLesson.content.length - 1) {
            setCurrentItemIndex((prev) => prev + 1);
            resetGame();
            return;
        }

        if (activeLesson.index < lessons.length - 1) {
            const nextLesson = lessons[activeLesson.index + 1];
            setActiveLesson({ ...nextLesson, index: activeLesson.index + 1 });
            setCurrentItemIndex(0);
            resetGame();
            return;
        }

        router.push('/learn');
    }, [activeLesson, currentItemIndex, lessons, resetGame, router]);

    const handleSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (gameState === 'finished') {
                handleNext();
            }
        },
        [gameState, handleNext],
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
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
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
                                          : 'Complete!'}
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
                                        userInput={typingState.userInput}
                                    />

                                    <div className="flex-1">
                                        <KeyboardVisual activeKey={nextChar} className="max-w-3xl" />
                                    </div>

                                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                        <Input
                                            ref={inputRef}
                                            type="text"
                                            value={typingState.userInput}
                                            onChange={handleInputChange}
                                            className="font-mono text-lg"
                                            autoFocus
                                            spellCheck={false}
                                            autoComplete="off"
                                            autoCorrect="off"
                                            autoCapitalize="off"
                                        />

                                        {gameState === 'finished' && (
                                            <div className="flex justify-center">
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                                                >
                                                    {activeLesson.index < lessons.length - 1
                                                        ? 'Next Level'
                                                        : 'View Learning Tips'}
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
}
