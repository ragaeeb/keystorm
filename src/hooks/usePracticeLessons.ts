import type { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { loadEarlyLevels } from '@/lib/lesson/lazy';
import { normalizeLessonContent } from '@/lib/lesson/normalizer';
import type { Lesson } from '@/types/lesson';

/**
 * Custom hook for loading and managing practice lessons
 *
 * Handles lesson loading from sessionStorage (custom lessons) or JSON files (defaults).
 * Automatically redirects to /practice?mode=letters if letter practice is not completed.
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
                router.replace('/practice?mode=letters');
                return;
            }

            const capitalsCompleted = sessionStorage.getItem('capitalsCompleted');
            const numbersCompleted = sessionStorage.getItem('numbersCompleted');
            const punctuationCompleted = sessionStorage.getItem('punctuationCompleted');

            sessionStorage.removeItem('practiceSummary');
            onReset();

            const storedLessons = sessionStorage.getItem('lessons');
            let lessonSource: Lesson[] = [];

            if (storedLessons) {
                try {
                    lessonSource = JSON.parse(storedLessons);
                } catch (error) {
                    console.warn('Failed to parse lessons from storage', error);
                }
            }

            // Fallback if AI lessons are missing or empty
            if (lessonSource.length === 0) {
                try {
                    lessonSource = await loadEarlyLevels();
                } catch (error) {
                    console.error('Failed to load default lessons:', error);
                    setMounted(true);
                    return;
                }
            }

            // --- FIX: Filter based on ALL completion flags ---
            const filtered = lessonSource.filter((lesson) => {
                if (lesson.type === 'letters') {
                    return false;
                }

                if (capitalsCompleted === 'true') {
                    if (lesson.type === 'words' || lesson.type === 'capitals') {
                        return false;
                    }
                }

                if (numbersCompleted === 'true') {
                    if (lesson.type === 'sentences' || lesson.type === 'numbers') {
                        return false;
                    }
                }

                if (punctuationCompleted === 'true') {
                    if (lesson.type === 'mixed' || lesson.type === 'punctuation') {
                        return false;
                    }
                }

                return true;
            });
            // --- END FIX ---

            const normalized = normalizeLessonContent(filtered);
            setLessons(normalized);
            setMounted(true);
        };

        loadLessons();
    }, [router, onReset]);

    return { lessons, mounted };
};
