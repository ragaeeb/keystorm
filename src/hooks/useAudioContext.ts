import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for managing audio feedback in typing practice
 *
 * Provides three sound effects:
 * - Error sound: Low-pitched beep for incorrect keystrokes
 * - Success sound: Higher-pitched tone for correct keystrokes
 * - Confetti sound: Ascending tones for level completion
 *
 * Uses Web Audio API for synthesized sounds or HTML5 Audio for custom files.
 * Audio context is automatically cleaned up on unmount.
 *
 * @returns Object containing audio playback functions
 *
 * @example
 * ```tsx
 * const { playErrorSound, playSuccessSound, playConfettiSound } = useAudioContext();
 *
 * // Play error sound on wrong keystroke
 * if (userInput !== expectedChar) {
 *   playErrorSound();
 * }
 *
 * // Play success with custom sound file
 * playSuccessSound('/sounds/ding.mp3');
 * ```
 */
export const useAudioContext = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const errorAudioRef = useRef<HTMLAudioElement | null>(null);
    const successAudioRef = useRef<HTMLAudioElement | null>(null);
    const confettiAudioRef = useRef<HTMLAudioElement | null>(null);

    /**
     * Initializes Web Audio API context on mount
     * Cleans up on unmount to prevent memory leaks
     */
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioContextRef.current = new window.AudioContext();
        }
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    /**
     * Plays error sound using either custom audio file or synthesized tone
     * Default: 200Hz sine wave for 100ms
     *
     * @param customAudioUrl - Optional path to custom error sound file
     */
    const playErrorSound = useCallback((customAudioUrl?: string) => {
        if (customAudioUrl) {
            if (!errorAudioRef.current) {
                errorAudioRef.current = new Audio(customAudioUrl);
                errorAudioRef.current.volume = 0.3;
            }
            errorAudioRef.current.currentTime = 0;
            errorAudioRef.current.play().catch(() => {});
            return;
        }

        if (!audioContextRef.current) {
            return;
        }
        const ctx = audioContextRef.current;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 200;
        o.type = 'sine';
        g.gain.setValueAtTime(0.3, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 0.1);
    }, []);

    /**
     * Plays success sound using either custom audio file or synthesized tone
     * Default: 800Hz sine wave for 80ms
     *
     * @param customAudioUrl - Optional path to custom success sound file
     */
    const playSuccessSound = useCallback((customAudioUrl?: string) => {
        if (customAudioUrl) {
            if (!successAudioRef.current) {
                successAudioRef.current = new Audio(customAudioUrl);
                successAudioRef.current.volume = 0.3;
            }
            successAudioRef.current.currentTime = 0;
            successAudioRef.current.play().catch(() => {});
            return;
        }

        if (!audioContextRef.current) {
            return;
        }
        const ctx = audioContextRef.current;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 800;
        o.type = 'sine';
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        o.start(ctx.currentTime);
        o.stop(ctx.currentTime + 0.08);
    }, []);

    /**
     * Plays celebration sound using either custom audio file or synthesized ascending tones
     * Default: Three tones at 800Hz, 960Hz, 1120Hz for 300ms each
     *
     * @param customAudioUrl - Optional path to custom celebration sound file
     */
    const playConfettiSound = useCallback((customAudioUrl?: string) => {
        if (customAudioUrl) {
            if (!confettiAudioRef.current) {
                confettiAudioRef.current = new Audio(customAudioUrl);
                confettiAudioRef.current.volume = 0.5;
            }
            confettiAudioRef.current.currentTime = 0;
            confettiAudioRef.current.play().catch(() => {});
            return;
        }

        if (!audioContextRef.current) {
            return;
        }
        const ctx = audioContextRef.current;

        [0, 0.1, 0.2].forEach((delay) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.value = 800 + delay * 400;
            o.type = 'sine';
            const startTime = ctx.currentTime + delay;
            g.gain.setValueAtTime(0.15, startTime);
            g.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            o.start(startTime);
            o.stop(startTime + 0.3);
        });
    }, []);

    return { playConfettiSound, playErrorSound, playSuccessSound };
};
