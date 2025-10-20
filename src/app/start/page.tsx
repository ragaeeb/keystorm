'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_ISLAMIC_LESSONS } from '@/lib/default-lessons';
import type { Lesson } from '@/types/lesson';

const storeLessons = (lessons: Lesson[]) => {
    sessionStorage.setItem('lessons', JSON.stringify(lessons));
    sessionStorage.setItem('lettersCompleted', 'false');
};

export default function StartPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('Islam');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = useMemo(() => Boolean(session?.user), [session?.user]);

    const handleDefaultStart = useCallback(() => {
        storeLessons(DEFAULT_ISLAMIC_LESSONS);
        if (name.trim()) {
            sessionStorage.setItem('userName', name.trim());
        } else {
            sessionStorage.removeItem('userName');
        }
        router.push('/practice/letters');
    }, [name, router]);

    const handleSubmit = useCallback(async () => {
        if (!isAuthenticated) {
            setError('Sign in to personalize your lessons.');
            return;
        }

        if (!theme.trim()) {
            setError('Please enter a theme.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
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

            storeLessons(data.lessons as Lesson[]);
            if (name.trim()) {
                sessionStorage.setItem('userName', name.trim());
            } else {
                sessionStorage.removeItem('userName');
            }
            sessionStorage.setItem('theme', theme.trim());

            router.push('/practice/letters');
        } catch (err) {
            console.error('Error generating lessons:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate lessons. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, name, router, theme]);

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
                                : 'Use our curated Islamic lessons or sign in to create personalized themes.'}
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
                                    : 'Sign in to unlock custom themes. Guest mode uses our Islamic starter set.'}
                            </p>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="space-y-3">
                            <Button
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                                disabled={!isAuthenticated || loading || !theme.trim()}
                            >
                                {loading ? 'Generating lessons…' : 'Generate personalized lessons'}
                            </Button>
                            <Button onClick={handleDefaultStart} variant="outline" className="w-full">
                                Use default Islamic lessons
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
