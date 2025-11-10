import { create } from 'zustand';
import { loadLevelFromJson } from '@/lib/lesson/lazy';
import type { Lesson, LevelSummary } from '@/types/lesson';

/**
 * Flags representing whether key tutorial sections have been completed.
 */
type CompletionFlags = {
    capitalsCompleted: boolean;
    lettersCompleted: boolean;
    numbersCompleted: boolean;
    punctuationCompleted: boolean;
};

/**
 * Shape of the lesson store maintained through Zustand.
 */
type LessonState = {
    addCompletedLevel: (summary: LevelSummary) => void;
    clearCompletedLevels: () => void;
    clearError: () => void;
    completedLevels: LevelSummary[];
    completionFlags: CompletionFlags;
    error: string | null;
    getLesson: (level: number) => Lesson | undefined;
    hasCompletedLevel: (level: number) => boolean;
    hasEarlyLessons: boolean;
    isLoading: boolean;
    lessons: Lesson[];
    loadLevel: (level: number) => Promise<Lesson | null>;
    loadedLevels: Set<number>;
    resetProgress: () => void;
    setCompletionFlag: (flag: keyof CompletionFlags, value: boolean) => void;
    setLessons: (lessons: Lesson[]) => void;
};

/**
 * Zustand store for lesson management including loading, completion tracking,
 * and caching of lesson data.
 */
export const useLessonStore = create<LessonState>((set, get) => ({
    /**
     * Adds or updates the completion summary for a level.
     */
    addCompletedLevel: (summary) => {
        set((state) => {
            const filtered = state.completedLevels.filter((l) => l.level !== summary.level);
            return { completedLevels: [...filtered, summary].sort((a, b) => a.level - b.level) };
        });
    },
    /**
     * Clears all stored completion summaries.
     */
    clearCompletedLevels: () => {
        set({ completedLevels: [] });
    },
    /**
     * Resets the last error state.
     */
    clearError: () => {
        set({ error: null });
    },
    completedLevels: [],
    completionFlags: {
        capitalsCompleted: false,
        lettersCompleted: false,
        numbersCompleted: false,
        punctuationCompleted: false,
    },
    error: null,

    /**
     * Retrieves a lesson by its level number.
     */
    getLesson: (level) => {
        return get().lessons.find((l) => l.level === level);
    },

    /**
     * Determines whether the given level has been completed.
     */
    hasCompletedLevel: (level) => {
        return get().completedLevels.some((l) => l.level === level);
    },
    hasEarlyLessons: false,
    isLoading: false,
    lessons: [],
    loadedLevels: new Set(),

    /**
     * Loads a level from either the existing lessons or lazily from JSON.
     */
    loadLevel: async (level) => {
        const state = get();
        const existingLesson = state.lessons.find((l) => l.level === level);
        if (existingLesson) {
            console.log(
                `[Store] Level ${level} already in store (${state.loadedLevels.has(level) ? 'AI-generated' : 'cached'})`,
            );
            return existingLesson;
        }

        if (state.isLoading) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return get().lessons.find((l) => l.level === level) || null;
        }

        set({ error: null, isLoading: true });

        try {
            console.log(`[Store] Fetching level ${level} from JSON (lazy load)`);
            const lesson = await loadLevelFromJson(level);

            set((state) => ({
                isLoading: false,
                lessons: [...state.lessons, lesson].sort((a, b) => a.level - b.level),
                loadedLevels: new Set([...state.loadedLevels, level]),
            }));

            return lesson;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load level';
            set({ error: errorMessage, isLoading: false });
            console.error(`Failed to load level ${level}:`, error);
            return null;
        }
    },

    /**
     * Resets completion flags and recorded summaries.
     */
    resetProgress: () => {
        set({
            completedLevels: [],
            completionFlags: {
                capitalsCompleted: false,
                lettersCompleted: false,
                numbersCompleted: false,
                punctuationCompleted: false,
            },
        });
    },

    /**
     * Sets a tutorial completion flag.
     */
    setCompletionFlag: (flag, value) => {
        set((state) => ({ completionFlags: { ...state.completionFlags, [flag]: value } }));
    },

    /**
     * Replaces the lesson list and tracks whether only early levels are loaded.
     */
    setLessons: (lessons) => {
        const isEarly = lessons.length > 0 && lessons.every((l) => l.level <= 4);
        set({
            hasEarlyLessons: isEarly || get().hasEarlyLessons,
            lessons,
            loadedLevels: new Set(lessons.map((l) => l.level)),
        });
    },
}));
