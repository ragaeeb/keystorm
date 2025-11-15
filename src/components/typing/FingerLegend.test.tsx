import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';
import { FINGER_POSITIONS } from '@/lib/constants';
import FingerLegend from './FingerLegend';

describe('FingerLegend', () => {
    it('renders left hand keys with correct count', () => {
        render(<FingerLegend side="left" />);

        expect(screen.getByText(/left hand/i)).toBeDefined();
        const items = screen.getAllByText(/Index|Middle|Ring|Pinky/i);
        expect(items).toHaveLength(4);

        const expectedKeys = FINGER_POSITIONS.slice(0, 4).map((fp) => fp.keys.slice(0, 6).join(' '));
        expectedKeys.forEach((keys) => {
            expect(screen.getByText(keys)).toBeDefined();
        });
    });

    it('renders right hand legend', () => {
        render(<FingerLegend side="right" />);

        expect(screen.getByText(/right hand/i)).toBeDefined();
    });
});

