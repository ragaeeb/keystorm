'use client';

import { Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardVisual } from '@/components/typing/KeyboardVisual';
import { StatsDisplay } from '@/components/typing/StatsDisplay';
import { TextDisplay } from '@/components/typing/TextDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useGameStats } from '@/hooks/useGameStats';
import { useTypingGame } from '@/hooks/useTypingGame';

type LessonType = 'letters' | 'words' | 'sentences' | 'paragraphs';

type Lesson = { type: LessonType; content: string[]; level: number };

const MOCK_LESSONS: Lesson[] = [
    {
        content: [
            'a',
            's',
            'd',
            'f',
            'j',
            'k',
            'l',
            ';',
            'g',
            'h',
            'e',
            'i',
            'r',
            'u',
            'w',
            'o',
            'q',
            'p',
            't',
            'y',
            'v',
            'm',
            'c',
            'n',
            'b',
            'x',
            'z',
        ],
        level: 1,
        type: 'letters',
    },
    {
        content: ['salat', 'zakat', 'birr', 'taqwa', 'imam', 'umar', 'ali', 'fatima', 'aisha', 'muhammad'],
        level: 2,
        type: 'words',
    },
    {
        content: [
            'There are five daily obligatory prayers.',
            'Charity purifies the soul and wealth.',
            'Patience is a virtue in times of hardship.',
        ],
        level: 3,
        type: 'sentences',
    },
    {
        content: [
            'Patience persists through persistent practice. Believers build bridges between belief and benevolence. Sincere servants seek sacred serenity.',
        ],
        level: 4,
        type: 'paragraphs',
    },
];

export default function PracticePage() {
    const router = useRouter();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [mounted, setMounted] = useState(false);

    const { playErrorSound } = useAudioContext();

    const currentLesson = lessons[currentLessonIndex];
    const currentText = currentLesson?.content[currentItemIndex] || '';

    const { typingState, gameState, inputRef, startGame, handleInputChange, resetGame } = useTypingGame(
        currentText,
        playErrorSound,
    );

    const stats = useGameStats(typingState, currentText);
    const progress = currentText.length > 0 ? (typingState.userInput.length / currentText.length) * 100 : 0;
    const nextChar = typingState.userInput.length < currentText.length ? currentText[typingState.userInput.length] : '';

    useEffect(() => {
        setMounted(true);
        const storedLessons = sessionStorage.getItem('lessons');
        if (storedLessons) {
            setLessons(JSON.parse(storedLessons));
        } else {
            setLessons(MOCK_LESSONS);
        }
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (gameState === 'ready' && e.key === 'Enter') {
                e.preventDefault();
                startGame();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [gameState, startGame]);

    const handleNext = useCallback(() => {
        if (currentItemIndex < currentLesson.content.length - 1) {
            setCurrentItemIndex((p) => p + 1);
            resetGame();
        } else if (currentLessonIndex < lessons.length - 1) {
            setCurrentLessonIndex((p) => p + 1);
            setCurrentItemIndex(0);
            resetGame();
        } else {
            setCurrentLessonIndex(0);
            setCurrentItemIndex(0);
            resetGame();
        }
    }, [currentItemIndex, currentLessonIndex, currentLesson, lessons.length, resetGame]);

    if (!mounted || !currentLesson) {
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
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Level {currentLesson.level}</CardTitle>
                                <CardDescription className="text-sm">
                                    {gameState === 'ready'
                                        ? 'Press Enter to start'
                                        : gameState === 'playing'
                                          ? `Type the ${currentLesson.type}`
                                          : 'Complete!'}
                                </CardDescription>
                            </div>
                            <StatsDisplay stats={stats} />
                        </div>
                        <Progress value={progress} className="mt-2" />
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden py-3">
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
                                    className="flex flex-1 flex-col gap-3"
                                >
                                    <TextDisplay targetText={currentText} userInput={typingState.userInput} />

                                    <div className="flex-shrink-0">
                                        <KeyboardVisual activeKey={nextChar} />
                                    </div>

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
                                                onClick={handleNext}
                                                size="lg"
                                                className="bg-gradient-to-r from-indigo-600 to-purple-600"
                                            >
                                                {currentItemIndex < currentLesson.content.length - 1
                                                    ? 'Next'
                                                    : currentLessonIndex < lessons.length - 1
                                                      ? 'Next Level'
                                                      : 'Restart'}
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
