import { useCallback, useEffect, useRef } from 'react';

export const useAudioContext = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

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

    const playErrorSound = useCallback(() => {
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

    const playSuccessSound = useCallback((customAudioUrl?: string) => {
        if (customAudioUrl) {
            const audio = new Audio(customAudioUrl);
            audio.volume = 0.3;
            audio.play().catch(() => {});
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

    const playConfettiSound = useCallback((customAudioUrl?: string) => {
        if (customAudioUrl) {
            const audio = new Audio(customAudioUrl);
            audio.volume = 0.5;
            audio.play().catch(() => {});
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
