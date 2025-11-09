import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type LearnLayoutProps = {
    title: string;
    description: string | ReactNode;
    nextRoute: string;
    buttonText?: string;
    children: ReactNode;
};

/**
 * Reusable layout component for all tutorial/learn pages
 *
 * Provides consistent structure:
 * - Full-screen gradient background
 * - Centered card with max-width
 * - Header with title and description
 * - Content area with custom children
 * - Bottom navigation button
 *
 * @param props.title - Main heading text
 * @param props.description - Subtitle or instructions (can be JSX)
 * @param props.nextRoute - URL to navigate to when button is clicked
 * @param props.buttonText - Custom button text (default: "Press Enter to Continue")
 * @param props.children - Tutorial content (instructions, examples, images)
 */
export const LearnLayout = ({ title, description, nextRoute, buttonText, children }: LearnLayoutProps) => {
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

                        <form action={nextRoute} className="text-center">
                            <Button type="submit" size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                {buttonText || 'Press Enter to Continue'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
