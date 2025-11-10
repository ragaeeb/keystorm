'use client';
import { Card, CardTitle } from '@/components/ui/card';
import { FINGER_POSITIONS } from '@/lib/constants';

export default function FingerLegend({ side }: { side: 'left' | 'right' }) {
    const slice = side === 'left' ? FINGER_POSITIONS.slice(0, 4) : FINGER_POSITIONS.slice(4, 8);
    return (
        <Card className="p-4">
            <CardTitle className="mb-3 text-lg capitalize">{side} Hand</CardTitle>
            <div className="space-y-2">
                {slice.map((fp) => (
                    <div
                        key={fp.finger}
                        className="flex items-center gap-2 rounded p-2 text-sm"
                        style={{ backgroundColor: `${fp.color}20` }}
                    >
                        <div className="h-5 w-5 flex-shrink-0 rounded-full" style={{ backgroundColor: fp.color }} />
                        <div className="flex-1">
                            <div className="font-semibold">{fp.finger.split(' ')[1]}</div>
                            <div className="text-muted-foreground text-xs">{fp.keys.slice(0, 6).join(' ')}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
