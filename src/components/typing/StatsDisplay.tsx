import { CheckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { GameStats } from '@/lib/stats';

export const StatsDisplay: React.FC<{ stats: GameStats }> = ({ stats }) => (
    <div className="flex gap-3">
        <Badge variant="secondary" className="px-3 py-1 text-sm">
            {stats.wpm} WPM
        </Badge>
        <Badge variant="secondary" className="px-3 py-1 text-sm">
            {stats.accuracy}% Accuracy
        </Badge>
        <Badge
            variant={stats.errors === 0 ? 'default' : 'destructive'}
            className="flex items-center gap-1 px-3 py-1 text-sm"
        >
            {stats.errors === 0 && <CheckIcon className="h-3 w-3" />}
            {stats.errors} Errors
        </Badge>
    </div>
);
