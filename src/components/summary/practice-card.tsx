import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PracticeCard() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
            <Card className="max-w-lg p-8 text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">No Practice Data Yet</CardTitle>
                    <CardDescription>Complete a practice session to see your performance summary.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600" asChild>
                        <Link href="/practice">Start Practicing</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
