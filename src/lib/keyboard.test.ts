import { describe, expect, it } from 'bun:test';
import { getKeyPosition } from './keyboard';

describe('keyboard', () => {
    describe('getKeyPosition', () => {
        it('should get the position for A', () => {
            const actual = getKeyPosition('A');
            expect(actual).toMatchObject({ x: 50, y: 168 });
        });
    });
});
