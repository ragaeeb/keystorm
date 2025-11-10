import { useCallback, useEffect, useRef } from 'react';

export const useAudioContext = () => {
    const successAudioRef = useRef<HTMLAudioElement | null>(null);
    const confettiAudioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        audioContextRef.current = new window.AudioContext();

        // Create hidden container
        containerRef.current = document.createElement('div');
        containerRef.current.style.display = 'none';
        containerRef.current.setAttribute('aria-hidden', 'true');
        document.body.appendChild(containerRef.current);

        // Pre-load all audio files
        successAudioRef.current = new Audio('/sfx/keypress.mp3');
        successAudioRef.current.volume = 0.3;
        successAudioRef.current.preload = 'auto';
        containerRef.current.appendChild(successAudioRef.current);

        confettiAudioRef.current = new Audio('/sfx/confetti.mp3');
        confettiAudioRef.current.volume = 0.5;
        confettiAudioRef.current.preload = 'auto';
        containerRef.current.appendChild(confettiAudioRef.current);

        return () => {
            audioContextRef.current?.close();
            if (containerRef.current?.parentNode) {
                containerRef.current.parentNode.removeChild(containerRef.current);
            }

            // Add these lines to prevent stale ref access on unmount
            successAudioRef.current = null;
            confettiAudioRef.current = null;
            containerRef.current = null;
            audioContextRef.current = null;
        };
    }, []);

    const playSuccessSound = useCallback(() => {
        if (!successAudioRef.current) {
            return;
        }

        const audio = successAudioRef.current;
        audio.currentTime = 0;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Silently fail if user hasn't interacted yet or play is interrupted
            });
        }
    }, []);

    const playErrorSound = useCallback(() => {
        // Always use synthesized sound
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

    const playConfettiSound = useCallback(() => {
        if (!confettiAudioRef.current) {
            return;
        }

        const audio = confettiAudioRef.current;
        audio.currentTime = 0;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Silently fail if user hasn't interacted yet or play is interrupted
            });
        }
    }, []);

    return { playConfettiSound, playErrorSound, playSuccessSound };
};
