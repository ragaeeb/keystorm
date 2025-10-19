import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { generateLessons } from '@/lib/lesson-generator';
import { isThemeAllowed } from '@/lib/theme-validation';

const payloadSchema = z.object({ theme: z.string().min(1) });

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

        const lessons = await generateLessons(theme);
        return NextResponse.json({ lessons });
    } catch (error) {
        console.error('Error generating lessons:', error);
        return NextResponse.json({ error: 'Failed to generate lessons' }, { status: 500 });
    }
};
