import { useEffect } from 'react';

/**
 * Custom hook for debug mode keyboard shortcut (Ctrl+Shift+D)
 *
 * Enables quick skipping to the last item in a level for testing purposes.
 * Only active in development mode or when URL contains ?debug=true parameter.
 *
 * When triggered:
 * - Calls onSkip callback with total item count
 * - Logs debug message to console
 * - Prevents default browser behavior
 *
 * @param totalItems - Total number of items in current level
 * @param onSkip - Callback function to execute when debug skip is triggered
 *
 * @example
 * ```tsx
 * const [currentIndex, setCurrentIndex] = useState(0);
 *
 * useDebugSkip(letters.length, (total) => {
 *   setCurrentIndex(Math.max(0, total - 1));
 * });
 * ```
 */
export const useDebugSkip = (totalItems: number, onSkip: (totalItems: number) => void) => {
    useEffect(() => {
        const handleDebugKey = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'D') {
                event.preventDefault();

                const isDev = process.env.NODE_ENV === 'development';
                const hasDebugParam = typeof window !== 'undefined' && window.location.search.includes('debug=true');

                if (isDev || hasDebugParam) {
                    console.log(`[Debug] Skipping to last item (${totalItems} total)`);
                    onSkip(totalItems);
                }
            }
        };

        window.addEventListener('keydown', handleDebugKey);
        return () => window.removeEventListener('keydown', handleDebugKey);
    }, [totalItems, onSkip]);
};
