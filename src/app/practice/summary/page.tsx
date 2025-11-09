'use client';

import { useEffect, useState } from 'react';
import CompletedLevels from '@/components/summary/completed-levels';
import OverallStatsCard from '@/components/summary/overall-stats-card';
import PracticeCard from '@/components/summary/practice-card';
import { Card } from '@/components/ui/card';
import type { PracticeSummary } from '@/types/summary';

/**
 * PracticeSummaryPageClient - Performance summary and statistics display
 *
 * Loads and displays comprehensive practice session statistics from sessionStorage.
 * Shows:
 * - Overall performance metrics (average WPM, accuracy, total errors, exercises completed)
 * - Per-level detailed breakdowns with accuracy progress bars
 * - Completion timestamp
 * - Navigation options to restart practice or review learning tips
 *
 * Handles three states:
 * - Loading: Fetching data from sessionStorage
 * - Empty: No practice data available (redirects to start)
 * - Success: Displays full summary with statistics
 *
 * Data validation ensures proper structure before rendering.
 *
 * @returns Rendered practice summary client component
 */
export default function PracticeSummaryPage() {
    const [summary, setSummary] = useState<PracticeSummary>();
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
