import { create } from 'zustand';
import { loadLevelFromJson } from '@/lib/lesson/lazy';
import type { Lesson, LevelSummary } from '@/types/lesson';

type CompletionFlags = {
    lettersCompleted: boolean;
    capitalsCompleted: boolean;
    numbersCompleted: boolean;
    punctuationCompleted: boolean;
};

type LessonState = {
    lessons: Lesson[];
    loadedLevels: Set<number>;
    completionFlags: CompletionFlags;
    completedLevels: LevelSummary[];
    isLoading: boolean;
    error: string | null;
    hasEarlyLessons: boolean;

    setLessons: (lessons: Lesson[]) => void;
    loadLevel: (level: number) => Promise<Lesson | null>;
    getLesson: (level: number) => Lesson | undefined;
    setCompletionFlag: (flag: keyof CompletionFlags, value: boolean) => void;
    addCompletedLevel: (summary: LevelSummary) => void;
    resetProgress: () => void;
    clearError: () => void;
    hasCompletedLevel: (level: number) => boolean;
};

export const useLessonStore = create<LessonState>((set, get) => ({
    addCompletedLevel: (summary) => {
        set((state) => {
            const filtered = state.completedLevels.filter((l) => l.level !== summary.level);
            return { completedLevels: [...filtered, summary].sort((a, b) => a.level - b.level) };
        });
    },
    clearCompletedLevels: () => {
        set({ completedLevels: [] });
    },
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

    getLesson: (level) => {
        return get().lessons.find((l) => l.level === level);
    },

    hasCompletedLevel: (level) => {
        return get().completedLevels.some((l) => l.level === level);
    },
    hasEarlyLessons: false,
    isLoading: false,
    lessons: [],
    loadedLevels: new Set(),

    loadLevel: async (level) => {
        const state = get();

        // Check if already loaded (from AI generation or previous fetch)
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

    setCompletionFlag: (flag, value) => {
        set((state) => ({ completionFlags: { ...state.completionFlags, [flag]: value } }));
    },

    setLessons: (lessons) => {
        const isEarly = lessons.length > 0 && lessons.every((l) => l.level <= 4);
        set({
            hasEarlyLessons: isEarly || get().hasEarlyLessons,
            lessons,
            loadedLevels: new Set(lessons.map((l) => l.level)),
        });
    },
}));
