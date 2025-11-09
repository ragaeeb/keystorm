'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientProgress } from '@/components/ui/gradient-progress';
import type { LessonType } from '@/types/lesson';

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

type LevelSummary = {
    averageAccuracy: number;
    averageWpm: number;
    items: number;
    level: number;
    totalAccuracy: number;
    totalErrors: number;
    totalWpm: number;
    type: LessonType;
};

type PracticeSummary = {
    completedAt: string;
    levels: LevelSummary[];
    overall: {
        averageAccuracy: number;
        averageWpm: number;
        totalErrors: number;
        totalItems: number;
        totalLevels: number;
    };
};

export default function PracticeSummaryPage() {
    const router = useRouter();
    const [summary, setSummary] = useState<PracticeSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = sessionStorage.getItem('practiceSummary');
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as PracticeSummary;

                if (!parsed.levels || !Array.isArray(parsed.levels) || !parsed.overall) {
                    console.error('Invalid practice summary structure');
                    setLoading(false);
                    return;
                }

                setSummary(parsed);
            } catch (error) {
                console.error('Failed to parse practice summary', error);
            }
        }
        setLoading(false);
    }, []);

    const sortedLevels = useMemo(() => {
        if (!summary) {
            return [];
        }
        return summary.levels.toSorted((a, b) => a.level - b.level);
    }, [summary]);

    const completionDate = summary?.completedAt ? new Date(summary.completedAt) : null;

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <Card className="p-8">
                    <p className="text-center text-gray-600">Loading summary...</p>
                </Card>
            </div>
        );
    }

    if (!summary || summary.levels.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
                <Card className="max-w-lg p-8 text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl">No Practice Data Yet</CardTitle>
                        <CardDescription>Complete a practice session to see your performance summary.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600"
                            onClick={() => router.push('/practice')}
                        >
                            Start Practicing
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
                <Card className="bg-white/90 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-3xl">All Levels Complete!</CardTitle>
                        <CardDescription>
                            {completionDate
                                ? `Finished on ${DATE_FORMATTER.format(completionDate)}`
                                : 'Great work completing every level.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <SummaryStat label="Average WPM" value={summary.overall.averageWpm} />
                            <SummaryStat label="Average Accuracy" value={`${summary.overall.averageAccuracy}%`} />
                            <SummaryStat label="Total Errors" value={summary.overall.totalErrors} />
                            <SummaryStat label="Exercises Completed" value={summary.overall.totalItems} />
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Button
                                className="bg-gradient-to-r from-indigo-600 to-purple-600"
                                onClick={() => router.push('/practice')}
                            >
                                Practice Again
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/learn')}>
                                View Learning Tips
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                    {sortedLevels.map((level) => (
                        <Card key={level.level} className="bg-white/80">
                            <CardHeader>
                                <CardTitle className="text-xl">Level {level.level}</CardTitle>
                                <CardDescription className="capitalize">Focus: {level.type}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="mb-1 flex items-center justify-between font-medium text-sm">
                                        <span>Accuracy</span>
                                        <span>{level.averageAccuracy}%</span>
                                    </div>
                                    <GradientProgress value={level.averageAccuracy} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg border bg-white/60 p-3 text-center">
                                        <p className="text-muted-foreground text-xs uppercase">Average WPM</p>
                                        <p className="mt-1 font-semibold text-lg">{level.averageWpm}</p>
                                    </div>
                                    <div className="rounded-lg border bg-white/60 p-3 text-center">
                                        <p className="text-muted-foreground text-xs uppercase">Total Errors</p>
                                        <p className="mt-1 font-semibold text-lg">{level.totalErrors}</p>
                                    </div>
                                </div>
                                <p className="text-center text-muted-foreground text-xs">
                                    {level.items} exercise{level.items === 1 ? '' : 's'} completed in this level.
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}

type SummaryStatProps = { label: string; value: string | number };

const SummaryStat = ({ label, value }: SummaryStatProps) => (
    <div className="rounded-lg border bg-white/70 p-4 text-center shadow-sm">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
        <p className="mt-2 font-semibold text-2xl">{value}</p>
    </div>
);
