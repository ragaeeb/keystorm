'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import KeyboardWithHands from '@/components/typing/KeyboardWithHands';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ROUNDS } from '@/lib/constants';

export default function PracticePage() {
    const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
    const [currentRound, setCurrentRound] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [errors, setErrors] = useState(0);
    const [backspaceCount, setBackspaceCount] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [activeKey, setActiveKey] = useState('');

    const audioContextRef = useRef<AudioContext | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    const playErrorSound = useCallback(() => {
        if (!audioContextRef.current) {
            return;
        }
        const ctx = audioContextRef.current;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 200;
        o.type = 'sine';
        g.gain.setValueAtTime(0.3, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 0.1);
    }, []);

    const startGame = useCallback(() => {
        const sentences = ROUNDS[currentRound].sentences;
        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        setCurrentText(randomSentence);
        setUserInput('');
        setErrors(0);
        setBackspaceCount(0);
        setStartTime(Date.now());
        setGameState('playing');
        // Focus the typing input as soon as the round starts
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [currentRound]);

    // Make Enter work even if no input has focus
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

    const calculateStats = useCallback(
        (input: string, target: string, timeElapsed: number) => {
            const words = input.trim().split(' ').filter(Boolean).length || 0;
            const minutes = Math.max(timeElapsed / 60000, 0.001);
            const calculatedWpm = Math.round(words / minutes) || 0;

            let correctChars = 0;
            for (let i = 0; i < input.length; i++) {
                if (input[i] === target[i]) {
                    correctChars++;
                }
            }
            const totalChars = input.length || 1;
            const errorPenalty = backspaceCount * 0.5;
            const calculatedAccuracy = Math.max(0, Math.round((correctChars / totalChars) * 100 - errorPenalty));

            setWpm(calculatedWpm);
            setAccuracy(calculatedAccuracy);
        },
        [backspaceCount],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            const prevLength = userInput.length;

            if (value.length < prevLength) {
                setBackspaceCount((p) => p + 1);
            }

            if (value.length > userInput.length) {
                const lastChar = value[value.length - 1];
                const expectedChar = currentText[value.length - 1];
                if (lastChar !== expectedChar) {
                    setErrors((p) => p + 1);
                    playErrorSound();
                }
            }

            setUserInput(value);

            if (startTime) {
                const timeElapsed = Date.now() - startTime;
                calculateStats(value, currentText, timeElapsed);
            }

            if (value === currentText) {
                setGameState('finished');
            }
        },
        [userInput, currentText, startTime, calculateStats, playErrorSound],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (gameState === 'playing' && e.key !== 'Tab') {
                setActiveKey(e.key);
            }
        },
        [gameState],
    );

    const handleKeyUp = useCallback(() => setActiveKey(''), []);

    const nextRound = useCallback(() => {
        if (currentRound < ROUNDS.length - 1) {
            setCurrentRound((p) => p + 1);
            setGameState('ready');
        } else {
            setCurrentRound(0);
            setGameState('ready');
        }
    }, [currentRound]);

    const progress = useMemo(
        () => (currentText.length > 0 ? (userInput.length / currentText.length) * 100 : 0),
        [userInput.length, currentText.length],
    );

    const displayText = useMemo(
        () =>
            currentText.split('').map((char, i) => {
                let className = 'text-2xl ';
                if (i < userInput.length) {
                    className += userInput[i] === char ? 'text-green-600' : 'text-red-600 font-bold';
                } else if (i === userInput.length) {
                    className += 'text-gray-900 border-b-4 border-blue-500';
                } else {
                    className += 'text-gray-400';
                }
                return (
                    <span key={i} className={className}>
                        {char}
                    </span>
                );
            }),
        [currentText, userInput],
    );

    const nextChar = useMemo(
        () => (userInput.length < currentText.length ? currentText[userInput.length] : ''),
        [userInput.length, currentText],
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
            <div className="mx-auto max-w-6xl">
                <Card className="shadow-xl">
                    {/* Sticky header for all states */}
                    <CardHeader className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Level {ROUNDS[currentRound].level}</CardTitle>
                                <CardDescription>
                                    {gameState === 'ready'
                                        ? 'Press Enter to start typing'
                                        : gameState === 'playing'
                                          ? 'Type the sentence below'
                                          : 'Round complete'}
                                </CardDescription>
                            </div>
                            <div className="flex gap-4">
                                <Badge variant="secondary" className="px-4 py-2 text-lg">
                                    {wpm} WPM
                                </Badge>
                                <Badge variant="secondary" className="px-4 py-2 text-lg">
                                    {accuracy}% Accuracy
                                </Badge>
                                <Badge variant="destructive" className="px-4 py-2 text-lg">
                                    {errors} Errors
                                </Badge>
                            </div>
                        </div>
                        <Progress value={progress} className="mt-3" />
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {gameState === 'ready' && (
                            <div className="flex flex-col items-center gap-6 py-12">
                                <Button
                                    size="lg"
                                    onClick={startGame}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600"
                                >
                                    Start
                                </Button>
                                {/* Fallback for Enter key if focus is lost */}
                                <Input
                                    type="text"
                                    className="sr-only"
                                    onKeyDown={(e) => e.key === 'Enter' && startGame()}
                                    autoFocus
                                />
                            </div>
                        )}

                        {gameState !== 'ready' && (
                            <>
                                {/* Prompt */}
                                <div className="rounded-lg bg-gray-50 p-6 font-mono leading-relaxed">{displayText}</div>

                                {/* Keyboard (smaller to reduce vertical scroll) */}
                                <div className="mx-auto w-full max-w-2xl">
                                    <KeyboardWithHands activeKey={nextChar} />
                                </div>

                                {/* Typing input */}
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    value={userInput}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    onKeyUp={handleKeyUp}
                                    className="font-mono text-xl"
                                    autoFocus
                                    spellCheck={false}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                />

                                {gameState === 'finished' && (
                                    <div className="flex items-center justify-center gap-4 pt-2">
                                        <Button
                                            onClick={nextRound}
                                            size="lg"
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600"
                                        >
                                            {currentRound < ROUNDS.length - 1 ? 'Next Level' : 'Start Over'}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
