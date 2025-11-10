import type { LessonType } from './lesson';

/**
 * Performance metrics for a single completed level
 */
type LevelSummary = {
    /** Average accuracy percentage across all exercises in level */
    averageAccuracy: number;
    /** Average words per minute across all exercises in level */
    averageWpm: number;
    /** Total number of exercises completed in level */
    items: number;
    /** Level number (1-4) */
    level: number;
    /** Sum of accuracy percentages (used for overall calculations) */
    totalAccuracy: number;
    /** Total number of typing errors in level */
    totalErrors: number;
    /** Sum of WPM scores (used for overall calculations) */
    totalWpm: number;
    /** Type of content practiced in level */
    type: LessonType;
};

/**
 * Complete practice session summary with overall and per-level statistics
 */
export type PracticeSummary = {
    /** ISO 8601 timestamp when practice session completed */
    completedAt: string;
    /** Performance breakdown for each completed level */
    levels: LevelSummary[];
    /** Aggregated statistics across all levels */
    overall: {
        /** Average accuracy across all exercises */
        averageAccuracy: number;
        /** Average WPM across all exercises */
        averageWpm: number;
        /** Total errors across all exercises */
        totalErrors: number;
        /** Total exercises completed */
        totalItems: number;
        /** Number of levels completed */
        totalLevels: number;
    };
};
