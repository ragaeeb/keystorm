'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loadEarlyLevels } from '@/lib/lesson/lazy';
import { isThemeAllowed } from '@/lib/theme-validation';
import { useLessonStore } from '@/store/useLessonStore';
import { useUserStore } from '@/store/useUserStore';
import type { Lesson } from '@/types/lesson';

export default function StartPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const name = useUserStore((state) => state.name);
    const theme = useUserStore((state) => state.theme);
    const setName = useUserStore((state) => state.setName);
    const setTheme = useUserStore((state) => state.setTheme);

    const setLessons = useLessonStore((state) => state.setLessons);
    const resetProgress = useLessonStore((state) => state.resetProgress);
    const hasEarlyLessons = useLessonStore((state) => state.hasEarlyLessons);

    const isAuthenticated = Boolean(session?.user);

    const handleDefaultStart = useCallback(async () => {
        resetProgress();

        if (!hasEarlyLessons) {
            setLoading(true);
            try {
                console.log('[StartPage] Loading default early lessons (1-4) from JSON');
                const earlyLessons = await loadEarlyLevels();
                setLessons(earlyLessons);
            } catch (err) {
                console.error('Failed to load default lessons:', err);
                setError('Failed to load lessons. Please try again.');
                setLoading(false);
                return;
            }
            setLoading(false);
        }

        router.push('/learn');
    }, [router, resetProgress, setLessons, hasEarlyLessons]);

    const handleSubmit = useCallback(async () => {
        if (!isAuthenticated) {
            setError('Sign in to personalize your lessons.');
            return;
        }

        if (!theme.trim()) {
            setError('Please enter a theme.');
            return;
        }

        if (!isThemeAllowed(theme.trim())) {
            setError('This theme is not allowed. Please choose a family-friendly topic.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('[StartPage] Requesting AI-generated early lessons (1-4) for theme:', theme);
            const response = await fetch('/api/generate-lessons', {
                body: JSON.stringify({ theme: theme.trim() }),
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            });

            if (!response.ok) {
                const payload = await response.json();
                throw new Error(payload.error ?? 'Failed to generate lessons');
            }

            const data = await response.json();

            if (!Array.isArray(data.lessons)) {
                throw new Error('Invalid response format from API');
            }

            console.log('[StartPage] Received AI early lessons (1-4), storing in Zustand');
            setLessons(data.lessons as Lesson[]);
            console.log('[StartPage] Levels 5-10 will be lazily loaded from JSON as user progresses');

            router.push('/learn');
        } catch (err) {
            console.error('Error generating lessons:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate lessons. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, theme, setLessons, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Choose your path</CardTitle>
                        <CardDescription>
                            {isAuthenticated
                                ? 'Pick a theme to generate fresh lessons tailored just for you.'
                                : 'Use our curated lessons or sign in to create personalized themes.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name or Nickname (optional)</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                autoFocus
                                disabled={loading}
                                onKeyDown={(e) => e.key === 'Enter' && handleDefaultStart()}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="theme">Learning Theme</Label>
                            <Input
                                id="theme"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                placeholder="e.g., Islam, Science, History"
                                disabled={!isAuthenticated || loading}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                            <p className="text-gray-500 text-xs">
                                {isAuthenticated
                                    ? 'We will validate your theme to keep the content family-friendly.'
                                    : 'Sign in to unlock custom themes. Default lessons load from our library.'}
                            </p>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="space-y-3">
                            <Button
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                                disabled={!isAuthenticated || loading || !theme.trim()}
                            >
                                {loading ? 'Generating early lessons…' : 'Generate personalized lessons (Levels 1-4)'}
                            </Button>
                            <Button
                                onClick={handleDefaultStart}
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Loading lessons…' : 'Use default lessons'}
                            </Button>
                        </div>

                        <p className="text-center text-gray-500 text-xs">
                            Levels 5-10 will load automatically as you progress
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
