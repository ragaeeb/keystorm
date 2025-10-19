// app/learn/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FingerLegend from '@/components/typing/FingerLegend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LearnPage() {
    const router = useRouter();

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                router.push('/practice');
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
                        <CardDescription>
                            Rest left hand on A-S-D-F and right hand on J-K-L-; . Press Enter to continue.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Image hero (Wikimedia Commons, CC BY-SA 3.0) */}
                        <figure className="relative mx-auto w-full max-w-[980px]">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Keyboard_layout_english_fingers.png/960px-Keyboard_layout_english_fingers.png"
                                alt="Hands resting on ASDF and JKL; home-row keys with color-coded finger zones"
                                className="h-auto w-full rounded-lg bg-black/90 shadow-2xl"
                                loading="eager"
                                decoding="async"
                            />
                            <figcaption className="mt-2 text-center text-muted-foreground text-xs">
                                “Keyboard layout english fingers.png” • CC BY-SA 3.0 (Wikimedia Commons).
                            </figcaption>
                        </figure>

                        {/* Legends */}
                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                            <FingerLegend side="left" />
                            <FingerLegend side="right" />
                        </div>

                        <div className="mt-8 text-center">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600"
                                onClick={() => router.push('/practice')}
                            >
                                Press Enter to Start Typing
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
