import type { LessonType } from '@/types/lesson';

/**
 * Gets the instructional description for a typing lesson level
 * @param type - The type of lesson content
 * @returns User-friendly description of what the level will test
 */
export const getLevelDescription = (type: LessonType): string => {
    switch (type) {
        case 'letters':
            return 'practice individual letters to build muscle memory for each key position';
        case 'words':
            return 'type complete words using lowercase letters only, focus on smooth transitions between keys';
        case 'capitals':
            return 'master capital letters using the Shift key, practice proper hand coordination';
        case 'sentences':
            return 'practice full sentences with proper capitalization and basic punctuation';
        case 'numbers':
            return 'learn the number row and basic symbols, develop speed with numeric content';
        case 'mixed':
            return 'combine letters, numbers, and mixed case in complete sentences';
        case 'punctuation':
            return 'master complex punctuation marks and special symbols with accuracy';
        case 'paragraphs':
            return 'type short paragraphs with varied content, maintain consistent speed and accuracy';
        case 'advanced':
            return 'challenge yourself with long passages and advanced vocabulary';
        case 'expert':
            return 'master all character types in complex, real-world content at high speed';
        default:
            return 'complete this level to progress in your typing journey';
    }
};

/**
 * Gets the next route after completing a level
 * Includes tutorial pages before new skill introductions
 *
 * @param currentType - Current lesson type
 * @returns Route to navigate to, or null if it's the last level
 */
export const getNextLevelRoute = (currentType: LessonType): string | null => {
    const routeMap: Record<LessonType, string | null> = {
        advanced: '/practice',
        capitals: '/practice', // <-- FIX: Was '/learn/numbers', now correctly routes to /practice for Level 4
        expert: '/practice/summary',
        letters: '/practice',
        mixed: '/learn/punctuation',
        numbers: '/practice',
        paragraphs: '/practice',
        punctuation: '/practice',
        sentences: '/learn/numbers', // This is now correct, flows from L4 to L5's tutorial
        words: '/learn/shift',
    };

    return routeMap[currentType] ?? '/practice';
};
