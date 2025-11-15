import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';
import type { GameStats } from '@/lib/stats';
import { StatsDisplay } from './StatsDisplay';

const renderStats = (stats: GameStats) => render(<StatsDisplay stats={stats} />);

describe('StatsDisplay', () => {
    it('shows typing metrics', () => {
        renderStats({ accuracy: 98, errors: 0, wpm: 72 });

        expect(screen.getByText(/72 wpm/i)).toBeDefined();
        expect(screen.getByText(/98% accuracy/i)).toBeDefined();
        expect(screen.getByText(/0 errors/i)).toBeDefined();
    });

    it('shows error count when mistakes occur', () => {
        renderStats({ accuracy: 80, errors: 3, wpm: 40 });

        expect(screen.getByText(/3 errors/i)).toBeDefined();
    });
});

