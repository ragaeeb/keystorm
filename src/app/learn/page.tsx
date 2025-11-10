'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FingerLegend from '@/components/typing/FingerLegend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * LearnPage - Keyboard positioning tutorial
 *
 * Displays an educational guide showing:
 * - Proper home row finger positioning (ASDF JKL;)
 * - Visual keyboard layout with color-coded finger zones
 * - Finger legends for left and right hands
 * - Instructions for proceeding to letter practice
 *
 * Listens for Enter key to advance to practice automatically.
 *
 * @returns Rendered learn page client component
 */
export default function LearnPage() {
    const router = useRouter();

    /**
     * Sets up keyboard listener for Enter key to proceed to practice
     * Cleanup removes listener on unmount
     */
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                router.push('/practice?mode=letters');
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
            <div className="mx-auto max-w-6xl">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">Place Your Fingers Like This</CardTitle>
                        <CardDescription className="space-y-2">
                            <p>
                                <strong>Left hand:</strong> Pinky on A, Ring on S, Middle on D, Index on F
                            </p>
                            <p>
                                <strong>Right hand:</strong> Index on J, Middle on K, Ring on L, Pinky on ;
                            </p>
                            <p>
                                <strong>Thumbs:</strong> Both rest on the spacebar
                            </p>
                            <p className="text-xs">
                                Press <kbd className="rounded bg-gray-200 px-2 py-1 font-mono">Enter</kbd> with your
                                right pinky to continue
                            </p>
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <figure className="relative mx-auto w-full max-w-[980px]">
                            <Image
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Keyboard_layout_english_fingers.png/960px-Keyboard_layout_english_fingers.png"
                                alt="Hands resting on ASDF and JKL; home-row keys with color-coded finger zones"
                                className="h-auto w-full rounded-lg bg-black/90 shadow-2xl"
                                width={960}
                                height={360}
                                priority
                            />
                            <figcaption className="mt-2 text-center text-muted-foreground text-xs">
                                "Keyboard layout english fingers.png" • CC BY-SA 3.0 (Wikimedia Commons).
                            </figcaption>
                        </figure>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            <FingerLegend side="left" />
                            <FingerLegend side="right" />
                        </div>

                        <div className="mt-8 text-center">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600"
                                onClick={() => router.push('/practice?mode=letters')}
                            >
                                Press Enter to Start Letter Practice
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
