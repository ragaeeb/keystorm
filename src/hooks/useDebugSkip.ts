import { useEffect } from 'react';

type DebugSkipOptions = {
    /** Total number of items in current level */
    totalItems: number;
    /** Callback to skip to last item (Ctrl+Shift+L) */
    onSkipToLast: (totalItems: number) => void;
    /** Optional callback to skip to next item (Ctrl+Shift+N) */
    onSkipToNext?: () => void;
    /** Optional callback to skip to next level (Ctrl+Shift+Right) */
    onSkipToNextLevel?: () => void;
    /** Optional ref to focus after skip */
    inputRef?: React.RefObject<HTMLInputElement | null>;
};

/**
 * Debug keyboard shortcuts for practice pages
 *
 * Shortcuts (dev mode or ?debug=true):
 * - Ctrl+Shift+L: Skip to last item
 * - Ctrl+Shift+N: Skip to next item
 * - Ctrl+Shift+→: Skip to next level
 */
export const useDebugSkip = ({
    totalItems,
    onSkipToLast,
    onSkipToNext,
    onSkipToNextLevel,
    inputRef,
}: DebugSkipOptions) => {
    useEffect(() => {
        const handleDebugKey = (event: KeyboardEvent) => {
            if (!event.ctrlKey || !event.shiftKey) {
                return;
            }

            const isDev = process.env.NODE_ENV === 'development';
            const hasDebugParam = typeof window !== 'undefined' && window.location.search.includes('debug=true');

            if (!isDev && !hasDebugParam) {
                return;
            }

            if (event.key === 'L') {
                event.preventDefault();
                console.log(`[Debug] Skipping to last item (${totalItems} total)`);
                onSkipToLast(totalItems);

                setTimeout(() => {
                    inputRef?.current?.focus();
                    inputRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            } else if (event.key === 'N' && onSkipToNext) {
                event.preventDefault();
                console.log('[Debug] Skipping to next item');
                onSkipToNext();

                setTimeout(() => {
                    inputRef?.current?.focus();
                    inputRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            } else if (event.key === 'ArrowRight' && onSkipToNextLevel) {
                event.preventDefault();
                console.log('[Debug] Skipping to next level');
                onSkipToNextLevel();
            }
        };

        window.addEventListener('keydown', handleDebugKey);
        return () => window.removeEventListener('keydown', handleDebugKey);
    }, [totalItems, onSkipToLast, onSkipToNext, onSkipToNextLevel, inputRef]);
};
