import { type NextRequest, NextResponse } from 'next/server';
import { generateLessons } from '@/lib/lesson-generator';

export const POST = async (request: NextRequest) => {
    try {
        const { theme } = await request.json();

        if (!theme || typeof theme !== 'string') {
            return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
        }

        const lessons = await generateLessons(theme);
        return NextResponse.json({ lessons });
    } catch (error) {
        console.error('Error generating lessons:', error);
        return NextResponse.json({ error: 'Failed to generate lessons' }, { status: 500 });
    }
};
