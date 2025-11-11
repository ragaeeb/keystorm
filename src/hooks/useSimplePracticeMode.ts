import { useRouter } from 'next/navigation';
import { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useAudioContext } from '@/hooks/useAudioContext';
import { useDebugSkip } from '@/hooks/useDebugSkip';
import { useTypingGame } from '@/hooks/useTypingGame';
import { getNextLevelRoute } from '@/lib/lesson/descriptions';
import { useLessonStore } from '@/store/useLessonStore';
import type { LessonType } from '@/types/lesson';

type CompletionFlag = 'lettersCompleted' | 'capitalsCompleted' | 'numbersCompleted' | 'punctuationCompleted';

type SimplePracticeConfig = {
    completionFlag: CompletionFlag;
    lessonType: Extract<LessonType, 'letters' | 'capitals'>;
    level: number;
    restrictInputToLastCharacter?: boolean;
    skipRoute: string;
};

type SimplePracticeState = {
    currentIndex: number;
    currentItem: string;
    gameState: ReturnType<typeof useTypingGame>['gameState'];
    handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleSkip: () => void;
    inputRef: ReturnType<typeof useTypingGame>['inputRef'];
    isReady: boolean;
    itemsLength: number;
    nextChar: string;
    progress: number;
    showConfetti: boolean;
    typingState: ReturnType<typeof useTypingGame>['typingState'];
};

export function useSimplePracticeMode(config: SimplePracticeConfig): SimplePracticeState {
    const { completionFlag, lessonType, level, restrictInputToLastCharacter = false, skipRoute } = config;

    const router = useRouter();
    const { playErrorSound, playSuccessSound, playConfettiSound } = useAudioContext();

    const loadLevel = useLessonStore((state) => state.loadLevel);
    const getLesson = useLessonStore((state) => state.getLesson);
    const isLoading = useLessonStore((state) => state.isLoading);
    const setCompletionFlag = useLessonStore((state) => state.setCompletionFlag);

    const [items, setItems] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const currentItem = items[currentIndex] ?? '';
    const isLastItem = isReady && items.length > 0 && currentIndex === items.length - 1;

    const {
        typingState,
        gameState,
        inputRef,
        startGame,
        handleInputChange: baseHandleInputChange,
        resetGame,
    } = useTypingGame(currentItem, playErrorSound, playSuccessSound, isLastItem ? playConfettiSound : undefined);

    useEffect(() => {
        const loadPracticeItems = async () => {
            const lesson = getLesson(level) || (await loadLevel(level));

            if (lesson) {
                setItems(lesson.content);
                setCurrentIndex(0);
            }

            setShowConfetti(false);
            setIsReady(true);
        };

        void loadPracticeItems();
    }, [getLesson, level, loadLevel]);

    useEffect(() => {
        if (!isReady || !currentItem || isLoading) {
            return;
        }

        resetGame();
        startGame();

        const timeout = setTimeout(() => {
            const element = inputRef.current;
            element?.focus();
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        return () => clearTimeout(timeout);
    }, [currentItem, inputRef, isLoading, isReady, resetGame, startGame]);

    const progress = useMemo(() => {
        if (items.length === 0) {
            return 0;
        }

        const completedItems = currentIndex + (gameState === 'finished' ? 1 : 0);
        return Math.round((completedItems / items.length) * 100);
    }, [currentIndex, gameState, items.length]);

    const nextChar = useMemo(() => {
        if (!currentItem) {
            return '';
        }

        const nextIndex = typingState.userInput.length;
        return nextIndex < currentItem.length ? currentItem[nextIndex] : '';
    }, [currentItem, typingState.userInput.length]);

    const handleSkipToNextLevel = useCallback(() => {
        setCompletionFlag(completionFlag, true);
        const nextRoute = getNextLevelRoute(level, lessonType);
        router.push(nextRoute);
    }, [completionFlag, level, lessonType, router, setCompletionFlag]);

    useEffect(() => {
        if (gameState !== 'finished') {
            return;
        }

        let completionTimeout: ReturnType<typeof setTimeout> | undefined;

        const timeout = setTimeout(() => {
            if (currentIndex < items.length - 1) {
                setCurrentIndex((previous) => Math.min(previous + 1, items.length - 1));
                return;
            }

            setShowConfetti(true);
            completionTimeout = setTimeout(() => {
                handleSkipToNextLevel();
            }, 2500);
        }, 250);

        return () => {
            clearTimeout(timeout);
            if (completionTimeout) {
                clearTimeout(completionTimeout);
            }
        };
    }, [currentIndex, gameState, handleSkipToNextLevel, items.length]);

    const handleSkip = useCallback(() => {
        setCompletionFlag(completionFlag, true);
        router.push(skipRoute);
    }, [completionFlag, router, setCompletionFlag, skipRoute]);

    useDebugSkip({
        inputRef,
        onSkipToLast: (total) => setCurrentIndex(Math.max(0, total - 1)),
        onSkipToNext: () => setCurrentIndex((previous) => Math.min(previous + 1, Math.max(items.length - 1, 0))),
        onSkipToNextLevel: handleSkipToNextLevel,
        totalItems: items.length,
    });

    const handleInputChange = useMemo(() => {
        if (!restrictInputToLastCharacter) {
            return baseHandleInputChange;
        }

        return (event: ChangeEvent<HTMLInputElement>) => {
            const lastChar = event.target.value.slice(-1);
            // Only update if there's a character to process
            if (lastChar) {
                // Create a new event with modified value
                Object.defineProperty(event, 'target', { value: { ...event.target, value: lastChar }, writable: true });
                baseHandleInputChange(event);
            }
        };
    }, [baseHandleInputChange, restrictInputToLastCharacter]);

    return {
        currentIndex,
        currentItem,
        gameState,
        handleInputChange,
        handleSkip,
        inputRef,
        isReady: isReady && !isLoading,
        itemsLength: items.length,
        nextChar,
        progress,
        showConfetti,
        typingState,
    };
}
