'use client';

import { useMemo } from 'react';
import CompletedLevels from '@/components/summary/completed-levels';
import OverallStatsCard from '@/components/summary/overall-stats-card';
import PracticeCard from '@/components/summary/practice-card';
import { useLessonStore } from '@/store/useLessonStore';
import type { PracticeSummary } from '@/types/summary';

export default function PracticeSummaryPage() {
    const completedLevels = useLessonStore((state) => state.completedLevels);

    const summary: PracticeSummary | null = useMemo(() => {
        if (completedLevels.length === 0) {
            return null;
        }

        const totalAccuracy = completedLevels.reduce((sum, level) => sum + level.totalAccuracy, 0);
        const totalWpm = completedLevels.reduce((sum, level) => sum + level.totalWpm, 0);
        const totalErrors = completedLevels.reduce((sum, level) => sum + level.totalErrors, 0);
        const totalItems = completedLevels.reduce((sum, level) => sum + level.items, 0);
        const totalLevels = completedLevels.length;

        const averageAccuracy = totalItems > 0 ? Math.round(totalAccuracy / totalItems) : 0;
        const averageWpm = totalItems > 0 ? Math.round(totalWpm / totalItems) : 0;

        return {
            completedAt: new Date().toISOString(),
            levels: completedLevels,
            overall: {
                averageAccuracy,
                averageWpm,
                totalErrors,
                totalItems,
                totalLevels,
            },
        };
    }, [completedLevels]);

    if (!summary) {
        return <PracticeCard />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <div className="mx-auto flex max-w-5xl flex-col gap-6">
                <OverallStatsCard summary={summary} completionDate={new Date(summary.completedAt)} />
                <CompletedLevels summary={summary} />
            </div>
        </div>
    );
}
