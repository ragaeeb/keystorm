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

    setLessons: (lessons: Lesson[]) => void;
    loadLevel: (level: number) => Promise<Lesson | null>;
    setCompletionFlag: (flag: keyof CompletionFlags, value: boolean) => void;
    addCompletedLevel: (summary: LevelSummary) => void;
    resetProgress: () => void;
    clearError: () => void;
};

export const useLessonStore = create<LessonState>((set, get) => ({
    addCompletedLevel: (summary) => {
        set((state) => {
            const filtered = state.completedLevels.filter((l) => l.level !== summary.level);
            return { completedLevels: [...filtered, summary].sort((a, b) => a.level - b.level) };
        });
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
    isLoading: false,
    lessons: [],
    loadedLevels: new Set(),

    loadLevel: async (level) => {
        const state = get();

        if (state.loadedLevels.has(level)) {
            return state.lessons.find((l) => l.level === level) || null;
        }

        if (state.isLoading) {
            return null;
        }

        set({ error: null, isLoading: true });

        try {
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
        set({ lessons, loadedLevels: new Set(lessons.map((l) => l.level)) });
    },
}));
