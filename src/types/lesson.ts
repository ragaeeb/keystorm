/**
 * Categories of typing practice content
 */
export type LessonType = 'letters' | 'words' | 'sentences' | 'paragraphs';

/**
 * A typing practice lesson with content and metadata
 */
export type Lesson = {
    /** Array of items to type (letters, words, sentences, or paragraphs) */
    content: string[];
    /** Difficulty level (1-4) */
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
