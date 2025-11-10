'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLessonStore } from '@/store/useLessonStore';

type LearnLayoutProps = {
    title: string;
    description: string | ReactNode;
    nextRoute: string;
    buttonText?: string;
    completionFlag?: 'numbersCompleted' | 'punctuationCompleted';
    children: ReactNode;
};

export const LearnLayout = ({
    title,
    description,
    nextRoute,
    buttonText,
    completionFlag,
    children,
}: LearnLayoutProps) => {
    const router = useRouter();
    const setCompletionFlag = useLessonStore((state) => state.setCompletionFlag);

    const handleNavigate = useCallback(() => {
        if (completionFlag) {
            setCompletionFlag(completionFlag, true);
        }
        router.push(nextRoute);
    }, [completionFlag, nextRoute, router, setCompletionFlag]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleNavigate();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleNavigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
            <div className="mx-auto max-w-6xl">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl">{title}</CardTitle>
                        <CardDescription className="space-y-2">
                            {typeof description === 'string' ? <p className="text-base">{description}</p> : description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {children}

                        <div className="text-center">
                            <Button
                                type="button"
                                onClick={handleNavigate}
                                size="lg"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600"
                            >
                                {buttonText || 'Press Enter to Continue'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
