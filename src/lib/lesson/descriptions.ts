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
 * Complete progression map: defines the exact route after each level
 * Format: [level, lessonType] -> next route
 */
const PROGRESSION_MAP: Record<string, string> = {
    '1-letters': '/practice',
    '2-words': '/learn/shift',
    '3-capitals': '/practice',
    '4-sentences': '/learn/numbers',
    '5-numbers': '/practice',
    '6-mixed': '/learn/punctuation',
    '7-punctuation': '/practice',
    '8-paragraphs': '/practice',
    '9-advanced': '/practice',
    '10-expert': '/practice/summary',
};

/**
 * Gets the next route after completing a level
 * Uses a simple map lookup for clarity and maintainability
 *
 * @param level - Current level number (1-10)
 * @param type - Current lesson type
 * @returns Route to navigate to
 */
export const getNextLevelRoute = (level: number, type: LessonType): string => {
    const key = `${level}-${type}`;
    return PROGRESSION_MAP[key] || '/practice';
};
