import type { LessonType } from '@/types/lesson';

/**
 * Gets the instructional description for a typing lesson level
 * @param type - The type of lesson content
 * @param level - The level number (currently unused but available for future customization)
 * @returns User-friendly description of what the level will test
 */
export const getLevelDescription = (type: LessonType, level: number): string => {
    switch (type) {
        case 'letters':
            return 'practice individual letters to build muscle memory for each key position';
        case 'words':
            return 'type complete words using lowercase letters only, focus on smooth transitions between keys';
        case 'sentences':
            return 'practice full sentences without capitalization, build your typing rhythm and accuracy';
        case 'paragraphs':
            return 'master longer passages with alliterations, challenge your speed while maintaining precision';
        default:
            return 'complete this level to progress in your typing journey';
    }
};
