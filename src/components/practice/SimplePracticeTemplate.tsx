import type { ReactNode } from 'react';
import ConfettiBoom from 'react-confetti-boom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientProgress } from '@/components/ui/gradient-progress';

type SimplePracticeTemplateProps = {
    children: ReactNode;
    description: string;
    onSkip: () => void;
    progress: number;
    showConfetti: boolean;
    skipLabel: string;
    title: string;
};

export function SimplePracticeTemplate({
    children,
    description,
    onSkip,
    progress,
    showConfetti,
    skipLabel,
    title,
}: SimplePracticeTemplateProps) {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            {showConfetti && (
                <ConfettiBoom
                    particleCount={100}
                    effectCount={3}
                    effectInterval={400}
                    colors={['#8BC34A', '#FF5252', '#FFB74D', '#4DD0E1', '#81C784', '#EC407A', '#AB47BC', '#5C6BC0']}
                />
            )}
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
                <Card className="flex flex-1 flex-col">
                    <CardHeader className="border-b bg-white/90 py-4 backdrop-blur">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg">{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <GradientProgress value={progress} className="w-40" />
                                <span className="text-gray-600 text-sm">{progress}%</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col gap-6 py-6">
                        {children}

                        <div className="flex justify-center">
                            <Button variant="ghost" onClick={onSkip}>
                                {skipLabel}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
