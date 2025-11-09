import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { generateLessons } from '@/lib/lesson/generator';
import { isThemeAllowed } from '@/lib/theme-validation';

const payloadSchema = z.object({ theme: z.string().min(1) });

/**
 * POST /api/generate-lessons
 * Generates themed typing lessons using Google Gemini AI
 *
 * Requires authentication via NextAuth session
 * Theme validation: 3-64 chars, alphanumeric, family-friendly
 *
 * @param body.theme - Educational theme (e.g., "Science", "History")
 * @returns 200 { lessons: Lesson[] } - Array of 4 lesson levels
 * @returns 400 { error: string } - Missing or invalid theme
 * @returns 401 { error: 'Unauthorized' } - No valid session
 * @returns 500 { error: string } - AI generation failed
 */
export const POST = async (request: NextRequest) => {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const parsed = payloadSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
        }

        const theme = parsed.data.theme.trim();

        if (!isThemeAllowed(theme)) {
            return NextResponse.json({ error: 'Theme is not permitted' }, { status: 400 });
        }

        console.log('GENERATE LESSONS ROUTE CALLED', theme);
        const lessons = await generateLessons(theme);
        return NextResponse.json({ lessons });
    } catch (error) {
        console.error('Error generating lessons:', {
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        return NextResponse.json({ error: 'Failed to generate lessons' }, { status: 500 });
    }
};
