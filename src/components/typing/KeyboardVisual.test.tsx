import { render } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';
import { KeyboardVisual } from './KeyboardVisual';

const queryActiveKeyRect = (container: HTMLElement) =>
    container.querySelector('rect[width="34"][filter="url(#glow)"]');

describe('KeyboardVisual', () => {
    it('renders accessible keyboard graphic', () => {
        const { container, getByRole } = render(<KeyboardVisual activeKey="" />);
        expect(getByRole('img', { name: /keyboard/i })).toBeDefined();
        expect(queryActiveKeyRect(container)).toBeNull();
    });

    it('highlights the active key', () => {
        const { container } = render(<KeyboardVisual activeKey="j" />);
        const activeRect = queryActiveKeyRect(container);
        expect(activeRect).not.toBeNull();
        expect(activeRect?.getAttribute('fill')).not.toBeNull();
    });
});

