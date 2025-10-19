'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StartPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('Islam');
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!name.trim() || !theme.trim()) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/generate-lessons', {
                body: JSON.stringify({ theme: theme.trim() }),
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to generate lessons');
            }

            const data = await response.json();

            sessionStorage.setItem('userName', name.trim());
            sessionStorage.setItem('theme', theme.trim());
            sessionStorage.setItem('lessons', JSON.stringify(data.lessons));

            router.push('/practice');
        } catch (error) {
            console.error('Error generating lessons:', error);
            alert('Failed to generate lessons. Please try again.');
            setLoading(false);
        }
    }, [name, theme, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Let's Get Started</CardTitle>
                        <CardDescription>Tell us a bit about yourself</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name or Nickname</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                autoFocus
                                disabled={loading}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="theme">Learning Theme</Label>
                            <Input
                                id="theme"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                placeholder="e.g., Islam, Science, History"
                                disabled={loading}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                            <p className="text-gray-500 text-xs">
                                We'll generate typing content based on your chosen theme
                            </p>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                            disabled={!name.trim() || !theme.trim() || loading}
                        >
                            {loading ? 'Generating Lessons...' : 'Start Learning'}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
