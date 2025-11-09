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
    const confettiAudioRef = useRef<HTMLAudioElement | null>(null);

    // Pool of success audio elements to prevent interruption
    const successAudioPoolRef = useRef<HTMLAudioElement[]>([]);
    const successAudioIndexRef = useRef(0);
    const isInitializedRef = useRef(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && !isInitializedRef.current) {
            audioContextRef.current = new window.AudioContext();
            isInitializedRef.current = true;
        }
        return () => {
            if (audioContextRef.current && isInitializedRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
                isInitializedRef.current = false;
            }
            errorAudioRef.current = null;
            confettiAudioRef.current = null;
            successAudioPoolRef.current = [];
        };
    }, []);

    const playErrorSound = useCallback((customAudioUrl?: string) => {
        if (customAudioUrl) {
            try {
                if (!errorAudioRef.current) {
                    errorAudioRef.current = new Audio(customAudioUrl);
                    errorAudioRef.current.volume = 0.3;
                }
                errorAudioRef.current.currentTime = 0;
                errorAudioRef.current.play().catch(() => {});
            } catch (err) {
                console.warn('Error audio failed:', err);
            }
            return;
        }

        if (!audioContextRef.current) {
            return;
        }
        try {
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
        } catch (err) {
            console.warn('Error sound synthesis failed:', err);
        }
    }, []);

    const playSuccessSound = useCallback((customAudioUrl?: string) => {
        if (customAudioUrl) {
            try {
                // Use pooled audio elements to prevent interruption during rapid typing
                if (successAudioPoolRef.current.length === 0) {
                    // Create pool of 5 audio elements
                    for (let i = 0; i < 5; i++) {
                        const audio = new Audio(customAudioUrl);
                        audio.volume = 0.3;
                        audio.preload = 'auto';
                        successAudioPoolRef.current.push(audio);
                    }
                }

                // Get next available audio from pool
                const audio = successAudioPoolRef.current[successAudioIndexRef.current];
                successAudioIndexRef.current = (successAudioIndexRef.current + 1) % successAudioPoolRef.current.length;

                audio.currentTime = 0;
                audio.play().catch(() => {});
            } catch (err) {
                console.warn('Success audio failed:', err);
            }
            return;
        }

        if (!audioContextRef.current) {
            return;
        }
        try {
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
        } catch (err) {
            console.warn('Success sound synthesis failed:', err);
        }
    }, []);

    const playConfettiSound = useCallback((customAudioUrl?: string) => {
        if (customAudioUrl) {
            try {
                if (!confettiAudioRef.current) {
                    confettiAudioRef.current = new Audio(customAudioUrl);
                    confettiAudioRef.current.volume = 0.5;
                }
                confettiAudioRef.current.currentTime = 0;
                confettiAudioRef.current.play().catch(() => {});
            } catch (err) {
                console.warn('Confetti audio failed:', err);
            }
            return;
        }

        if (!audioContextRef.current) {
            return;
        }
        try {
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
        } catch (err) {
            console.warn('Confetti sound synthesis failed:', err);
        }
    }, []);

    return { playConfettiSound, playErrorSound, playSuccessSound };
};
