import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { LearnLayout } from './learn-layout';

const routerPush = mock(() => {});

mock.module('next/navigation', () => ({
    useRouter: () => ({ push: routerPush }),
}));

const setCompletionFlag = mock(() => {});

mock.module('@/store/useLessonStore', () => ({
    useLessonStore: (selector: (state: any) => any) => selector({ setCompletionFlag }),
}));

describe('LearnLayout', () => {
    beforeEach(() => {
        routerPush.mockReset();
        setCompletionFlag.mockReset();
    });

    it('renders layout and triggers navigation on button click', () => {
        render(
            <LearnLayout
                title="Shift Keys"
                description="Practice shift usage"
                nextRoute="/next"
                completionFlag="numbersCompleted"
            >
                <p>Content</p>
            </LearnLayout>,
        );

        fireEvent.click(screen.getByRole('button', { name: /press enter to continue/i }));

        expect(setCompletionFlag).toHaveBeenCalledWith('numbersCompleted', true);
        expect(routerPush).toHaveBeenCalledWith('/next');
    });

    it('registers an Enter key listener', () => {
        const originalAddEventListener = window.addEventListener;
        const originalRemoveEventListener = window.removeEventListener;
        const addListener = mock(() => {});
        const removeListener = mock(() => {});

        window.addEventListener = addListener as typeof window.addEventListener;
        window.removeEventListener = removeListener as typeof window.removeEventListener;

        try {
            render(
                <LearnLayout title="Numbers" description="Practice" nextRoute="/practice/numbers">
                    <p>Numbers practice</p>
                </LearnLayout>,
            );

            expect(addListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        } finally {
            window.addEventListener = originalAddEventListener;
            window.removeEventListener = originalRemoveEventListener;
        }
    });
});

