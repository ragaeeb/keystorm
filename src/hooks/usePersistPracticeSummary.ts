import { useEffect } from 'react';
import type { LevelSummary } from '@/types/lesson';

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
