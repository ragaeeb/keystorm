import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';
import type { ChangeEvent } from 'react';
import type { Lesson } from '@/types/lesson';
import { useLessonStore } from '@/store/useLessonStore';
import type { useSimplePracticeMode as useSimplePracticeModeType } from './useSimplePracticeMode';

let useSimplePracticeMode: typeof useSimplePracticeModeType;

const routerPush = mock(() => {});

mock.module('next/navigation', () => ({
    useRouter: () => ({ push: routerPush }),
}));

const lesson: Lesson = {
    content: ['alpha', 'beta'],
    level: 1,
    type: 'letters',
};

const loadLevelMock = mock(async () => lesson);
const getLessonMock = mock(() => undefined as Lesson | undefined);
const setCompletionFlagMock = mock(() => {});

const originalStore = {
    loadLevel: useLessonStore.getState().loadLevel,
    getLesson: useLessonStore.getState().getLesson,
    setCompletionFlag: useLessonStore.getState().setCompletionFlag,
};

describe('useSimplePracticeMode', () => {
    const config = {
        completionFlag: 'lettersCompleted' as const,
        lessonType: 'letters' as const,
        level: 1,
        skipRoute: '/skip',
    };

    const originalAudioContext = globalThis.AudioContext;
    const originalAudio = globalThis.Audio;
    const originalWindowAudioContext = typeof window !== 'undefined' ? (window as any).AudioContext : undefined;
    const originalWindowAudio = typeof window !== 'undefined' ? (window as any).Audio : undefined;

    beforeAll(async () => {
        class SimpleAudioContext {
            close() {}
            createGain() {
                return {
                    connect() {},
                    gain: {
                        exponentialRampToValueAtTime() {},
                        setValueAtTime() {},
                    },
                };
            }
            createOscillator() {
                return {
                    connect() {},
                    frequency: { value: 0 },
                    start() {},
                    stop() {},
                    type: 'sine' as OscillatorType,
                };
            }
            get currentTime() {
                return 0;
            }
            get destination() {
                return {};
            }
        }

        function MockAudio(this: HTMLAudioElement, src?: string) {
            const element = document.createElement('audio');
            if (src) {
                element.setAttribute('src', src);
            }
            element.play = mock(async () => {});
            return element;
        }

        globalThis.AudioContext = SimpleAudioContext as unknown as typeof AudioContext;
        globalThis.Audio = MockAudio as unknown as typeof Audio;
        if (typeof window !== 'undefined') {
            (window as any).AudioContext = globalThis.AudioContext;
            (window as any).Audio = globalThis.Audio;
        }

        const module = await import('./useSimplePracticeMode');
        useSimplePracticeMode = module.useSimplePracticeMode;
    });

    beforeEach(() => {
        routerPush.mockReset();
        loadLevelMock.mockReset().mockResolvedValue(lesson);
        getLessonMock.mockReset().mockReturnValue(undefined);
        setCompletionFlagMock.mockReset();

        useLessonStore.setState({
            loadLevel: loadLevelMock as unknown as typeof originalStore.loadLevel,
            getLesson: getLessonMock as unknown as typeof originalStore.getLesson,
            setCompletionFlag: setCompletionFlagMock as unknown as typeof originalStore.setCompletionFlag,
            isLoading: false,
            lessons: [],
            loadedLevels: new Set<number>(),
        });
    });

    afterEach(() => {
        cleanup();
        useLessonStore.setState({
            loadLevel: originalStore.loadLevel,
            getLesson: originalStore.getLesson,
            setCompletionFlag: originalStore.setCompletionFlag,
            completionFlags: {
                capitalsCompleted: false,
                lettersCompleted: false,
                numbersCompleted: false,
                punctuationCompleted: false,
            },
            lessons: [],
            loadedLevels: new Set<number>(),
        });
    });

    afterAll(() => {
        mock.restore();
        useLessonStore.setState({
            loadLevel: originalStore.loadLevel,
            getLesson: originalStore.getLesson,
            setCompletionFlag: originalStore.setCompletionFlag,
            lessons: [],
            loadedLevels: new Set<number>(),
        });
        if (originalAudioContext) {
            globalThis.AudioContext = originalAudioContext;
        } else {
            delete (globalThis as any).AudioContext;
        }
        if (originalAudio) {
            globalThis.Audio = originalAudio;
        } else {
            delete (globalThis as any).Audio;
        }
        if (typeof window !== 'undefined') {
            if (originalWindowAudioContext) {
                (window as any).AudioContext = originalWindowAudioContext;
            } else {
                delete (window as any).AudioContext;
            }
            if (originalWindowAudio) {
                (window as any).Audio = originalWindowAudio;
            } else {
                delete (window as any).Audio;
            }
        }
    });

    it('loads lesson content and wires debug shortcuts', async () => {
        const { result } = renderHook(() => useSimplePracticeMode(config));

        await waitFor(() => {
            expect(result.current.isReady).toBe(true);
        });

        expect(loadLevelMock).toHaveBeenCalledWith(1);
        expect(result.current.itemsLength).toBe(2);
        await waitFor(() => {
            expect(result.current.gameState).toBe('playing');
        });
    });

    it('handles skip action by updating completion flag and navigating', async () => {
        const { result } = renderHook(() => useSimplePracticeMode(config));

        await waitFor(() => {
            expect(result.current.isReady).toBe(true);
        });

        await act(async () => {
            result.current.handleSkip();
        });

        expect(setCompletionFlagMock).toHaveBeenCalledWith('lettersCompleted', true);
        expect(routerPush).toHaveBeenCalledWith('/skip');
    });

    it('restricts input to the last character when enabled', async () => {
        const { result } = renderHook(() => useSimplePracticeMode({ ...config, restrictInputToLastCharacter: true }));

        await waitFor(() => {
            expect(result.current.isReady).toBe(true);
        });

        const event = { target: { value: 'ab' } } as unknown as ChangeEvent<HTMLInputElement>;

        await act(async () => {
            result.current.handleInputChange(event);
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(result.current.typingState.userInput).toBe('b');
        });
    });

    it('updates progress based on game state', async () => {
        const { result, rerender } = renderHook(() => useSimplePracticeMode(config));

        await waitFor(() => {
            expect(result.current.isReady).toBe(true);
        });

        expect(result.current.progress).toBe(0);

        await act(async () => {
            result.current.handleInputChange({ target: { value: 'alpha' } } as ChangeEvent<HTMLInputElement>);
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(result.current.progress).toBe(50);
        });

        rerender();
        await waitFor(() => {
            expect(result.current.progress).toBeGreaterThanOrEqual(50);
        });
    });
});

