import { motion } from 'motion/react';
import { type FormEvent, type RefObject, useEffect, useMemo } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { KeyboardVisual } from '@/components/typing/KeyboardVisual';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientProgress } from '@/components/ui/gradient-progress';
import { Input } from '@/components/ui/input';
import { getLevelDescription } from '@/lib/lesson/descriptions';
import type { GameStats } from '@/lib/stats';
import type { ActiveLesson } from '@/types/lesson';

type PracticeViewProps = {
    activeLesson: ActiveLesson;
    currentItemIndex: number;
    gameState: 'ready' | 'playing' | 'finished';
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    inputRef: RefObject<HTMLInputElement | null>;
    isLastLesson: boolean;
    itemProgress: number;
    levelComplete: boolean;
    nextChar: string;
    progress: number;
    showConfetti: boolean;
    startGame: () => void;
    stats: GameStats;
    userInput: string;
};

export const PracticeView = ({
    activeLesson,
    currentItemIndex,
    gameState,
    handleInputChange,
    handleSubmit,
    inputRef,
    isLastLesson,
    itemProgress,
    levelComplete,
    nextChar,
    progress,
    showConfetti,
    startGame,
    stats,
    userInput,
}: PracticeViewProps) => {
    const levelDescription = useMemo(
        () => getLevelDescription(activeLesson.type, activeLesson.level),
        [activeLesson.type, activeLesson.level],
    );

    const currentText = activeLesson.content[currentItemIndex];
    const totalItems = activeLesson.content.length;

    useEffect(() => {
        if (levelComplete) {
            const handleEnter = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit({} as FormEvent<HTMLFormElement>);
                }
            };
            window.addEventListener('keydown', handleEnter);
            return () => window.removeEventListener('keydown', handleEnter);
        }
    }, [levelComplete, handleSubmit]);

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
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-lg">
                                        Level {activeLesson.level} - {activeLesson.type}
                                    </CardTitle>
                                    <CardDescription className="capitalize">{levelDescription}</CardDescription>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-600 text-sm">
                                        Item {currentItemIndex + 1}/{totalItems}
                                    </span>
                                    <GradientProgress value={itemProgress} className="flex-1" />
                                    <span className="text-gray-600 text-sm">{itemProgress}%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-600 text-sm">Current</span>
                                    <GradientProgress value={progress} className="flex-1" />
                                    <span className="text-gray-600 text-sm">{Math.round(progress)}%</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-6 py-6">
                        {gameState === 'ready' && (
                            <div className="flex flex-1 flex-col items-center justify-center gap-6">
                                <h2 className="text-center font-semibold text-2xl text-gray-800">Ready to practice?</h2>
                                <Button onClick={startGame} size="lg">
                                    Start Level {activeLesson.level}
                                </Button>
                                <p className="text-center text-gray-500 text-sm">
                                    Or press <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">Enter</kbd> to
                                    begin
                                </p>
                            </div>
                        )}

                        {gameState === 'playing' && (
                            <div className="flex flex-1 flex-col items-center justify-center gap-6">
                                <motion.div
                                    key={currentText}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-lg bg-gray-50 p-6 font-mono text-2xl text-gray-800"
                                >
                                    {currentText}
                                </motion.div>

                                <div className="w-full max-w-2xl">
                                    <KeyboardVisual activeKey={nextChar} />
                                </div>

                                <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-2xl">
                                    <Input
                                        ref={inputRef}
                                        value={userInput}
                                        onChange={handleInputChange}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        className="w-full text-center font-mono text-xl"
                                        placeholder="Type here..."
                                    />
                                </form>

                                <div className="flex gap-8 text-sm">
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-500">WPM</span>
                                        <span className="font-semibold text-xl">{stats.wpm}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-500">Accuracy</span>
                                        <span className="font-semibold text-xl">{stats.accuracy}%</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-500">Errors</span>
                                        <span className="font-semibold text-xl">{stats.errors}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {levelComplete && (
                            <div className="flex flex-1 flex-col items-center justify-center gap-6">
                                <h2 className="text-center font-semibold text-3xl text-gray-800">Level Complete!</h2>
                                <p className="text-center text-gray-600">Great job! Ready for the next challenge?</p>
                                <Button size="lg" onClick={() => handleSubmit({} as FormEvent<HTMLFormElement>)}>
                                    {isLastLesson ? 'View Summary' : `Continue to Level ${activeLesson.level + 1}`}
                                </Button>
                                <p className="text-center text-gray-500 text-sm">
                                    Press <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">Enter</kbd> to
                                    continue
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
