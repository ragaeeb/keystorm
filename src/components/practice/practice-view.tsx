import { AnimatePresence, motion } from 'motion/react';
import type { ChangeEvent, FormEvent } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { KeyboardVisual } from '@/components/typing/KeyboardVisual';
import { StatsDisplay } from '@/components/typing/StatsDisplay';
import { TextDisplay } from '@/components/typing/TextDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientProgress } from '@/components/ui/gradient-progress';
import { Input } from '@/components/ui/input';
import type { useGameStats } from '@/hooks/useGameStats';
import { getLevelDescription } from '@/lib/lesson/descriptions';
import type { ActiveLesson } from '@/types/lesson';

type PracticeViewProps = {
    activeLesson: ActiveLesson;
    gameState: 'ready' | 'playing' | 'finished';
    handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
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

export const PracticeView = ({
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
                                    ? getLevelDescription(activeLesson.type, activeLesson.level)
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
                    <GradientProgress value={progress} className="mt-2" />
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
                                    Press Enter to Start
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
