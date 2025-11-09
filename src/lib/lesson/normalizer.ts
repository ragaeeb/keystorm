import type { Lesson } from '@/types/lesson';

/**
 * Converts lesson content to appropriate case based on lesson type
 * - Letters: always lowercase
 * - Words: lowercase
 * - Capitals: preserve capitalization (no normalization)
 * - Other types: preserve original case for proper punctuation/capitalization practice
 *
 * @param lessons - Array of lessons to normalize
 * @returns New array with normalized content
 */
export const normalizeLessonContent = (lessons: Lesson[]): Lesson[] => {
    return lessons.map((lesson) => {
        // Only normalize simple word lessons to lowercase
        // All other types (including capitals) preserve their case
        if (lesson.type === 'words') {
            return { ...lesson, content: lesson.content.map((text) => text.toLowerCase()) };
        }
        return lesson;
    });
};
