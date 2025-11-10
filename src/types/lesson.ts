/**
 * Categories of typing practice content - now with 10 progressive levels
 */
export type LessonType =
    | 'letters' // Level 1: Individual letters
    | 'words' // Level 2: Simple lowercase words
    | 'capitals' // Level 3: Words with capital letters (Shift key intro)
    | 'sentences' // Level 4: Basic sentences with punctuation
    | 'numbers' // Level 5: Numbers and basic symbols
    | 'mixed' // Level 6: Mixed case sentences with numbers
    | 'punctuation' // Level 7: Complex punctuation and symbols
    | 'paragraphs' // Level 8: Short paragraphs with mixed content
    | 'advanced' // Level 9: Long paragraphs with complex vocabulary
    | 'expert'; // Level 10: Expert-level content with all character types

/**
 * A typing practice lesson with content and metadata
 */
export type Lesson = {
    /** Array of items to type */
    content: string[];
    /** Difficulty level (1-10) */
    level: number;
    /** Type of content in this lesson */
    type: LessonType;
};

export type LevelSummary = {
    averageAccuracy: number;
    averageWpm: number;
    items: number;
    level: number;
    totalAccuracy: number;
    totalErrors: number;
    totalWpm: number;
    type: Lesson['type'];
};

export type ActiveLesson = Lesson & { index: number };
