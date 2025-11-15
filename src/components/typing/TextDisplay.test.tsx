import { render } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';
import { TextDisplay } from './TextDisplay';

describe('TextDisplay', () => {
    it('highlights characters based on user input', () => {
        const { container } = render(<TextDisplay targetText="abc" userInput="ab" />);

        const spans = container.querySelectorAll('span');
        expect(spans).toHaveLength(3);

        expect(spans[0].className).toContain('text-green-600');
        expect(spans[1].className).toContain('text-green-600');
        expect(spans[2].className).toContain('border-b-2');
    });

    it('marks incorrect characters in red and bold', () => {
        const { container } = render(<TextDisplay targetText="abc" userInput="ax" />);
        const spans = container.querySelectorAll('span');

        expect(spans[1].className).toContain('text-red-600');
        expect(spans[1].className).toContain('font-bold');
    });
});

