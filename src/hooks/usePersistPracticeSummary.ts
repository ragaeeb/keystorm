import { useEffect } from 'react';
import type { LevelSummary } from '@/types/lesson';

/**
 * Custom hook for persisting practice summary data to sessionStorage
 *
 * Automatically calculates and stores overall statistics from completed levels.
 * Summary includes:
 * - Overall average WPM and accuracy
 * - Total errors and items completed
 * - Per-level breakdowns
 * - Completion timestamp
 *
 * Data is cleared when completedLevels is empty, stored when levels are present.
 * This enables the summary page to display results after practice completion.
 *
 * @param mounted - Whether the component has mounted (prevents SSR issues)
 * @param completedLevels - Array of completed level summaries
 *
 * @example
 * ```tsx
 * const [completedLevels, setCompletedLevels] = useState<LevelSummary[]>([]);
 * usePersistPracticeSummary(mounted, completedLevels);
 * ```
 */
export const usePersistPracticeSummary = (mounted: boolean, completedLevels: LevelSummary[]) => {
    useEffect(() => {
        if (!mounted) {
            return;
        }

        if (completedLevels.length === 0) {
            sessionStorage.removeItem('practiceSummary');
            return;
        }

        const totalItems = completedLevels.reduce((acc, level) => acc + level.items, 0);
        const totalAccuracy = completedLevels.reduce((acc, level) => acc + level.totalAccuracy, 0);
        const totalWpm = completedLevels.reduce((acc, level) => acc + level.totalWpm, 0);
        const totalErrors = completedLevels.reduce((acc, level) => acc + level.totalErrors, 0);

        const summary = {
            completedAt: new Date().toISOString(),
            levels: completedLevels,
            overall: {
                averageAccuracy: totalItems === 0 ? 0 : Math.round(totalAccuracy / totalItems),
                averageWpm: totalItems === 0 ? 0 : Math.round(totalWpm / totalItems),
                totalErrors,
                totalItems,
                totalLevels: completedLevels.length,
            },
        } satisfies {
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

        sessionStorage.setItem('practiceSummary', JSON.stringify(summary));
    }, [completedLevels, mounted]);
};
