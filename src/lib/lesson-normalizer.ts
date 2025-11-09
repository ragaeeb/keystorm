import type { Lesson } from '@/types/lesson';

/**
 * Converts lesson content to lowercase for levels that don't require capitalization
 * @param lessons - Array of lessons to normalize
 * @returns New array with words, sentences, and paragraphs converted to lowercase
 */
export const normalizeLessonContent = (lessons: Lesson[]): Lesson[] => {
    return lessons.map((lesson) => {
        if (lesson.type === 'words' || lesson.type === 'sentences' || lesson.type === 'paragraphs') {
            return { ...lesson, content: lesson.content.map((text) => text.toLowerCase()) };
        }
        return lesson;
    });
};
