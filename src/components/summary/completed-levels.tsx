import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PracticeSummary } from '@/types/summary';
import { GradientProgress } from '../ui/gradient-progress';

export default function CompletedLevels({ summary }: { summary: PracticeSummary }) {
    const sortedLevels = useMemo(() => {
        if (!summary) {
            return [];
        }
        return summary.levels.toSorted((a, b) => a.level - b.level);
    }, [summary]);

    return (
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
    );
}
