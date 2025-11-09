import type { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DEFAULT_ISLAMIC_LESSONS } from '@/lib/default-lessons';
import { normalizeLessonContent } from '@/lib/lesson/normalizer';
import type { Lesson } from '@/types/lesson';

const FILTERED_DEFAULT_LESSONS = normalizeLessonContent(
    DEFAULT_ISLAMIC_LESSONS.filter((lesson) => lesson.type !== 'letters'),
);

export const usePracticeLessons = (
    router: ReturnType<typeof useRouter>,
    onReset: () => void,
): { lessons: Lesson[]; mounted: boolean } => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const storedLessons = sessionStorage.getItem('lessons');
        const lettersCompleted = sessionStorage.getItem('lettersCompleted');

        if (lettersCompleted !== 'true') {
            router.replace('/practice/letters');
            return;
        }

        sessionStorage.removeItem('practiceSummary');
        onReset();

        setMounted(true);

        if (storedLessons) {
            try {
                const parsed: Lesson[] = JSON.parse(storedLessons);
                const filtered = parsed.filter((lesson) => lesson.type !== 'letters');
                const normalized = normalizeLessonContent(filtered);
                setLessons(normalized.length > 0 ? normalized : FILTERED_DEFAULT_LESSONS);
            } catch (error) {
                console.warn('Failed to parse lessons from storage', error);
                setLessons(FILTERED_DEFAULT_LESSONS);
            }
        } else {
            setLessons(FILTERED_DEFAULT_LESSONS);
        }
    }, [router, onReset]);

    return { lessons, mounted };
};
