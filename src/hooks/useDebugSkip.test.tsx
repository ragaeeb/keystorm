import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, renderHook } from '@testing-library/react';
import { useDebugSkip } from './useDebugSkip';

describe('useDebugSkip', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalKeyboardEvent = globalThis.KeyboardEvent;

    beforeEach(() => {
        process.env.NODE_ENV = 'development';
        if (typeof globalThis.KeyboardEvent === 'undefined') {
            class MockKeyboardEvent extends Event {
                ctrlKey: boolean;
                shiftKey: boolean;
                key: string;
                constructor(type: string, init: KeyboardEventInit = {}) {
                    super(type, init);
                    this.ctrlKey = Boolean(init.ctrlKey);
                    this.shiftKey = Boolean(init.shiftKey);
                    this.key = init.key ?? '';
                }
            }

            globalThis.KeyboardEvent = MockKeyboardEvent as unknown as typeof KeyboardEvent;
            if (typeof window !== 'undefined') {
                (window as any).KeyboardEvent = globalThis.KeyboardEvent;
            }
        }
    });

    afterEach(() => {
        cleanup();
        process.env.NODE_ENV = originalEnv;
        document.body.innerHTML = '';
        if (originalKeyboardEvent) {
            globalThis.KeyboardEvent = originalKeyboardEvent;
            if (typeof window !== 'undefined') {
                (window as any).KeyboardEvent = originalKeyboardEvent;
            }
        } else {
            delete (globalThis as any).KeyboardEvent;
            if (typeof window !== 'undefined') {
                delete (window as any).KeyboardEvent;
            }
        }
    });

    it('handles skip to last item and focuses input', async () => {
        const onSkipToLast = mock((total: number) => total);
        const input = document.createElement('input');
        document.body.appendChild(input);

        const { unmount } = renderHook(() =>
            useDebugSkip({
                inputRef: { current: input },
                onSkipToLast,
                totalItems: 5,
            }),
        );

        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'L', shiftKey: true });
        window.dispatchEvent(event);

        expect(onSkipToLast).toHaveBeenCalledWith(5);

        await new Promise((resolve) => setTimeout(resolve, 150));
        expect(document.activeElement).toBe(input);

        unmount();
    });

    it('handles optional next item shortcut', async () => {
        const onSkipToNext = mock(() => {});
        const input = document.createElement('input');
        document.body.appendChild(input);

        renderHook(() =>
            useDebugSkip({
                inputRef: { current: input },
                onSkipToLast: () => {},
                onSkipToNext,
                totalItems: 3,
            }),
        );

        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'N', shiftKey: true });
        window.dispatchEvent(event);

        expect(onSkipToNext).toHaveBeenCalled();
        await new Promise((resolve) => setTimeout(resolve, 150));
        expect(document.activeElement).toBe(input);
    });

    it('supports skipping to next level and cleans up listener', () => {
        const onSkipToNextLevel = mock(() => {});

        const { unmount } = renderHook(() =>
            useDebugSkip({
                onSkipToLast: () => {},
                onSkipToNextLevel,
                totalItems: 2,
            }),
        );

        const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'ArrowRight', shiftKey: true });
        window.dispatchEvent(event);

        expect(onSkipToNextLevel).toHaveBeenCalledTimes(1);

        unmount();

        window.dispatchEvent(event);
        expect(onSkipToNextLevel).toHaveBeenCalledTimes(1);
    });
});

