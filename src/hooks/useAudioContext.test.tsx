import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { useAudioContext } from './useAudioContext';

const createdAudios: HTMLAudioElement[] = [];
const audioPlays: ReturnType<typeof mock>[] = [];

class MockOscillator {
    connect = mock(() => {});
    frequency = { value: 0 };
    type = '';
    start = mock(() => {});
    stop = mock(() => {});
}

class MockGain {
    connect = mock(() => {});
    gain = {
        exponentialRampToValueAtTime: mock(() => {}),
        setValueAtTime: mock(() => {}),
    };
}

class MockAudioContext {
    static instances: MockAudioContext[] = [];
    currentTime = 250;
    destination = {};
    createGain = mock(() => new MockGain());
    createOscillator = mock(() => new MockOscillator());
    close = mock(async () => {});

    constructor() {
        MockAudioContext.instances.push(this);
    }
}

describe('useAudioContext', () => {
    const originalAudioContext = globalThis.AudioContext;
    const originalAudio = globalThis.Audio;
    const originalWindowAudioContext = typeof window !== 'undefined' ? (window as any).AudioContext : undefined;
    const originalWindowAudio = typeof window !== 'undefined' ? (window as any).Audio : undefined;

    beforeEach(() => {
        createdAudios.length = 0;
        audioPlays.length = 0;
        MockAudioContext.instances.length = 0;

        globalThis.AudioContext = MockAudioContext as unknown as typeof AudioContext;
        if (typeof window !== 'undefined') {
            (window as any).AudioContext = MockAudioContext;
        }

        function MockAudio(this: HTMLAudioElement, src?: string) {
            const element = document.createElement('audio');
            if (src) {
                element.setAttribute('src', src);
            }
            const playSpy = mock(async () => {});
            audioPlays.push(playSpy);
            element.play = playSpy;
            createdAudios.push(element);
            return element;
        }

        globalThis.Audio = MockAudio as unknown as typeof Audio;
        if (typeof window !== 'undefined') {
            (window as any).Audio = globalThis.Audio;
        }
    });

    afterEach(() => {
        cleanup();
        document.body.innerHTML = '';
        globalThis.AudioContext = originalAudioContext;
        if (typeof window !== 'undefined') {
            if (originalWindowAudioContext) {
                (window as any).AudioContext = originalWindowAudioContext;
            } else {
                delete (window as any).AudioContext;
            }
        }
        if (originalAudio) {
            globalThis.Audio = originalAudio;
        } else {
            delete (globalThis as any).Audio;
        }
        if (typeof window !== 'undefined') {
            if (originalWindowAudio) {
                (window as any).Audio = originalWindowAudio;
            } else {
                delete (window as any).Audio;
            }
        }
    });

    it('initializes audio resources on mount and cleans up on unmount', async () => {
        const { result, unmount } = renderHook(() => useAudioContext());

        await waitFor(() => {
            expect(MockAudioContext.instances).toHaveLength(1);
            expect(createdAudios).toHaveLength(2);
        });

        expect(createdAudios.map((audio) => audio.getAttribute('src'))).toEqual([
            '/sfx/keypress.mp3',
            '/sfx/confetti.mp3',
        ]);

        result.current.playSuccessSound();
        result.current.playConfettiSound();

        createdAudios.forEach((audio) => {
            expect(audio.currentTime).toBe(0);
        });
        expect(audioPlays.every((spy) => spy.mock.calls.length === 1)).toBe(true);

        const container = document.querySelector('[aria-hidden="true"]');
        expect(container).not.toBeNull();

        unmount();
        expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
        expect(MockAudioContext.instances[0].close).toHaveBeenCalled();
    });

    it('plays synthesized error tone when context exists', async () => {
        const { result } = renderHook(() => useAudioContext());

        const contextInstance = await waitFor(() => {
            expect(MockAudioContext.instances.at(-1)).toBeInstanceOf(MockAudioContext);
            return MockAudioContext.instances.at(-1);
        });

        result.current.playErrorSound();

        expect(contextInstance?.createOscillator).toHaveBeenCalledTimes(1);
        const oscillator = contextInstance?.createOscillator.mock.results[0].value as MockOscillator;
        expect(oscillator.start).toHaveBeenCalled();
        expect(oscillator.stop).toHaveBeenCalled();
    });
});

