import type { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadEarlyLevels } from '@/lib/lesson/lazy';
import { normalizeLessonContent } from '@/lib/lesson/normalizer';
import type { Lesson } from '@/types/lesson';

/**
 * Custom hook for loading and managing practice lessons
 *
 * Handles lesson loading from sessionStorage (custom lessons) or JSON files (defaults).
 * Automatically redirects to /practice/letters if letter practice is not completed.
 * Filters out letter lessons and normalizes content for consistency.
 *
 * @param router - Next.js router instance from useRouter()
 * @param onReset - Callback to reset practice state when lessons are reloaded
 * @returns Object containing lessons array and mounted state
 *
 * @example
 * ```tsx
 * const { lessons, mounted } = usePracticeLessons(router, resetProgress);
 *
 * if (!mounted) {
 *   return <LoadingSpinner />;
 * }
 *
 * return <PracticeView lessons={lessons} />;
 * ```
 */
export const usePracticeLessons = (
    router: ReturnType<typeof useRouter>,
    onReset: () => void,
): { lessons: Lesson[]; mounted: boolean } => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const loadLessons = async () => {
            const lettersCompleted = sessionStorage.getItem('lettersCompleted');

            if (lettersCompleted !== 'true') {
                router.replace('/practice/letters');
                return;
            }

            sessionStorage.removeItem('practiceSummary');
            onReset();

            const storedLessons = sessionStorage.getItem('lessons');

            if (storedLessons) {
                try {
                    const parsed: Lesson[] = JSON.parse(storedLessons);
                    const filtered = parsed.filter((lesson) => lesson.type !== 'letters');
                    const normalized = normalizeLessonContent(filtered);

                    if (normalized.length > 0) {
                        setLessons(normalized);
                        setMounted(true);
                        return;
                    }
                } catch (error) {
                    console.warn('Failed to parse lessons from storage', error);
                }
            }

            try {
                const earlyLevels = await loadEarlyLevels();
                const filtered = earlyLevels.filter((lesson) => lesson.type !== 'letters');
                const normalized = normalizeLessonContent(filtered);
                setLessons(normalized);
            } catch (error) {
                console.error('Failed to load default lessons:', error);
            } finally {
                setMounted(true);
            }
        };

        loadLessons();
    }, [router, onReset]);

    return { lessons, mounted };
};
