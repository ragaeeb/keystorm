import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PracticeSummary } from '@/types/summary';

/**
 * Props for SummaryStat component
 */
type SummaryStatProps = { label: string; value: string | number };

/**
 * SummaryStat - Individual statistic display card
 *
 * Renders a single performance metric with label and value
 * in a styled card format.
 *
 * @param props - Component props
 * @returns Rendered stat card
 */
const SummaryStat = ({ label, value }: SummaryStatProps) => (
    <div className="rounded-lg border bg-white/70 p-4 text-center shadow-sm">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">{label}</p>
        <p className="mt-2 font-semibold text-2xl">{value}</p>
    </div>
);

/**
 * Internationalization formatter for date and time display
 * Uses browser's locale settings for automatic localization
 */
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

type OverallStatsCardProps = { completionDate: Date; summary: PracticeSummary };

export default function OverallStatsCard({ completionDate, summary }: OverallStatsCardProps) {
    return (
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
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" asChild>
                        <Link href="/practice">Practice Again</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/learn">View Learning Tips</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
